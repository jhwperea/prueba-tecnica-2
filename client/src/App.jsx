import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes';

// auth provider
import { AuthContext, AuthProvider } from 'contexts/authContext';
import { SocketProvider } from 'socket/SocketProvider';

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <AuthProvider>
        <AuthContext.Consumer>
          {({ user }) => (
            <SocketProvider userId={user?.useId}>
              <NavigationScroll>
                <>
                  <RouterProvider router={router} />
                  <ToastContainer position="top-right" autoClose={3000} theme="light" />
                </>
              </NavigationScroll>
            </SocketProvider>
          )}
        </AuthContext.Consumer>
      </AuthProvider>
    </ThemeCustomization>
  );
}