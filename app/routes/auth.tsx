import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
import {useLocation,useNavigate} from "react-router";
// ... (meta export remains the same)

const Auth = () => {
    const {isLoading, auth} = usePuterStore();
    const location = useLocation();

    // Safety check for 'next' path, providing a fallback (e.g., '/')
    const nextPath = location.search.split('next=')[1] || '/';
    const navigate = useNavigate();

    useEffect(() => {
        // 🎯 FIX: Only navigate if the user IS authenticated.
        // We also check !isLoading to ensure the state is finalized.
        if (!isLoading && auth.isAuthenticated) {
            navigate(nextPath, { replace: true }); // navigate to the intended destination
        }
    }, [auth.isAuthenticated, isLoading, nextPath, navigate]); // Added isLoading to deps

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>Log In to Continue Job Your Journey</h2>
                    </div>
                    <div>
                        {/* Render based on loading and authentication status */}
                        {isLoading ? (
                            <button className="auth-button animate-pulse" disabled>
                                <p> Signing you in... </p>
                            </button>
                        ) : (
                            // Show Log Out if authenticated, Log In if not
                            auth.isAuthenticated ? (
                                <button className="auth-button" onClick={auth.signOut}>
                                    <p>Log Out</p>
                                </button>
                            ) : (
                                <button className="auth-button" onClick={auth.signIn}>
                                    <p>Log In</p>
                                </button>
                            )
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Auth;