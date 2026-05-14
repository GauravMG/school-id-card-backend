import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';

// auth provider

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <NavigationScroll>
        <>
          <Toaster position="top-right" />
          <RouterProvider router={router} />
        </>
      </NavigationScroll>
    </ThemeCustomization>
  );
}
