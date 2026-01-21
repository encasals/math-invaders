import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from './config';

export class AuthService {
  private static instance: AuthService;
  public currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];
  
  // Cache for top scores
  private topScoresCache: Array<{ username: string; displayName: string; highScore: number; rank: number }> | null = null;
  private topScoresCacheTime: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private constructor() {
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.listeners.forEach(listener => listener(user));
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Add auth state listener
  public onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Email/password sign up
  public async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      console.log('Signing up user with email:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('User created successfully:', user.uid);

      // Create user profile in Firestore
      await this.createUserProfile(user, { displayName });

      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    }
  }

  // Email/password sign in
  public async signIn(email: string, password: string): Promise<User> {
    try {
      console.log('Signing in user with email:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('User signed in successfully:', user.uid);

      // Ensure user profile exists (create if it doesn't)
      await this.createUserProfile(user);
      
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }
  }

  // Google sign in
  public async signInWithGoogle(): Promise<User> {
    try {
      console.log('Signing in with Google...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google sign in successful:', user.uid);
      
      // Create user profile if it doesn't exist
      await this.createUserProfile(user);

      return user;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(error.message);
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Create user profile in Firestore
  private async createUserProfile(user: User, additionalData: any = {}): Promise<void> {
    if (!user) {
      console.error('No user provided to createUserProfile');
      return;
    }

    console.log('Creating user profile for:', user.uid);
    const userRef = doc(db, 'users', user.uid);
    
    try {
      const userDoc = await getDoc(userRef);
      console.log('User doc exists:', userDoc.exists());

      if (!userDoc.exists()) {
        const { displayName, email } = user;
        const createdAt = new Date();

        const userData = {
          displayName: additionalData.displayName || displayName || 'Anonymous',
          username: additionalData.username || null,
          email,
          createdAt,
          highScore: 0,
          gamesPlayed: 0,
          ...additionalData
        };

        console.log('Creating user profile with data:', userData);
        await setDoc(userRef, userData);
        console.log('User profile created successfully');

        // Verify the creation
        const verifyDoc = await getDoc(userRef);
        if (verifyDoc.exists()) {
          console.log('User profile verification successful:', verifyDoc.data());
        } else {
          console.error('User profile creation failed - document not found after creation');
        }
      } else {
        console.log('User profile already exists:', userDoc.data());
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error; // Re-throw to let caller handle it
    }
  }

  // Update user's high score
  public async updateHighScore(score: number): Promise<{ isNewRecord: boolean; previousScore: number }> {
    if (!this.currentUser) return { isNewRecord: false, previousScore: 0 };

    const userRef = doc(db, 'users', this.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentHighScore = userData.highScore || 0;

      if (score > currentHighScore) {
        await setDoc(userRef, {
          ...userData,
          highScore: score,
          gamesPlayed: (userData.gamesPlayed || 0) + 1,
          lastPlayed: new Date()
        });
        
        // Clear cache since rankings might have changed
        this.clearTopScoresCache();
        
        return { isNewRecord: true, previousScore: currentHighScore };
      } else {
        // Still update games played even if not a high score
        await setDoc(userRef, {
          ...userData,
          gamesPlayed: (userData.gamesPlayed || 0) + 1,
          lastPlayed: new Date()
        });
        return { isNewRecord: false, previousScore: currentHighScore };
      }
    }

    return { isNewRecord: false, previousScore: 0 };
  }

  // Update user's username
  public async updateUsername(username: string): Promise<void> {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    // Check if username is already taken
    const isAvailable = await this.isUsernameAvailable(username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    const userRef = doc(db, 'users', this.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      await setDoc(userRef, {
        ...userData,
        username: username
      });
    }
  }

  // Check if username is available
  public async isUsernameAvailable(username: string): Promise<boolean> {
    if (!username || username.trim().length < 3) return false;
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.trim().toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.empty;
  }

  // Get user's username
  public async getUserUsername(): Promise<string | null> {
    if (!this.currentUser) {
      console.log('No current user for getUserUsername');
      return null;
    }

    console.log('Getting username for user:', this.currentUser.uid);
    const userRef = doc(db, 'users', this.currentUser.uid);
    
    try {
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data found:', userData);
        return userData.username || null;
      } else {
        console.log('No user document found, creating user profile...');
        // If user document doesn't exist, create it
        await this.createUserProfile(this.currentUser);
        return null;
      }
    } catch (error) {
      console.error('Error getting username:', error);
      throw error;
    }
  }

  // Get user's high score
  public async getUserHighScore(): Promise<number> {
    if (!this.currentUser) return 0;

    const userRef = doc(db, 'users', this.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().highScore || 0;
    }

    return 0;
  }

  public isSignedIn(): boolean {
    return this.currentUser !== null;
  }

  public getDisplayName(): string {
    return this.currentUser?.displayName || 'Anonymous Player';
  }

  // Get top 10 highest scores for leaderboard
  public async getTopScores(forceRefresh: boolean = false): Promise<Array<{ username: string; displayName: string; highScore: number; rank: number }>> {
    const now = Date.now();
    
    // Return cached data if it's still valid and not forcing refresh
    if (!forceRefresh && 
        this.topScoresCache && 
        (now - this.topScoresCacheTime) < this.CACHE_DURATION) {
      console.log('Returning cached top scores');
      return this.topScoresCache;
    }

    try {
      console.log('Fetching fresh top scores from database');
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        orderBy('highScore', 'desc'), 
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const topScores: Array<{ username: string; displayName: string; highScore: number; rank: number }> = [];
      
      let rank = 1;
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.highScore && userData.highScore > 0) {
          topScores.push({
            username: userData.username || null,
            displayName: userData.displayName || 'Anonymous',
            highScore: userData.highScore,
            rank: rank++
          });
        }
      });
      
      // Update cache
      this.topScoresCache = topScores;
      this.topScoresCacheTime = now;
      console.log('Top scores fetched and cached:', topScores);
      
      return topScores;
    } catch (error) {
      console.error('Error getting top scores:', error);
      // Return cached data if available, even if expired
      return this.topScoresCache || [];
    }
  }

  // Clear top scores cache (call this when a new high score is achieved)
  public clearTopScoresCache(): void {
    console.log('Clearing top scores cache');
    this.topScoresCache = null;
    this.topScoresCacheTime = 0;
  }
}