import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home/Home";
import RootWrapper from "@/layout/RootWrapper";
import MainLayout from "@/layout/Mainlayout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";


const mainLayoutRoutes = [
    {
        path: "/",
        index: true,
        element: <Home />,
    }
];


const router = createBrowserRouter([
    {
        path: "/",
        element: <RootWrapper />,
        children: [
            {
                path: "/",
                element: <ProtectedRoute />,
                children: [],
            },
            {
                path: "/",
                element: <MainLayout />,
                children: mainLayoutRoutes,
            },

        ],
    },
]);

export default router;