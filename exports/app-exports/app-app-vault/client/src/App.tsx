import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import AppDetail from "./pages/AppDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Purchases from "./pages/Purchases";
import Wishlist from "./pages/Wishlist";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import SellerDashboard from "./pages/SellerDashboard";
import SellerApps from "./pages/SellerApps";
import SellerAppForm from "./pages/SellerAppForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApps from "./pages/AdminApps";
import AdminUsers from "./pages/AdminUsers";
import AdminReviews from "./pages/AdminReviews";
import CategoryPage from "./pages/CategoryPage";
import AppHub from "./pages/AppHub";
import Pricing from "./pages/Pricing";
import Blueprint from "./pages/Blueprint";
import Vault from "./pages/Vault";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:slug" component={AppDetail} />
      <Route path="/categories/:slug" component={CategoryPage} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order/success" component={OrderSuccess} />
      <Route path="/purchases" component={Purchases} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />
      {/* Seller */}
      <Route path="/seller" component={SellerDashboard} />
      <Route path="/seller/apps" component={SellerApps} />
      <Route path="/seller/apps/new" component={SellerAppForm} />
      <Route path="/seller/apps/:id/edit" component={SellerAppForm} />
      {/* App Hub */}
      <Route path="/hub" component={AppHub} />
      {/* Vault */}
      <Route path="/vault" component={Vault} />
      {/* Pricing & Blueprint */}
      <Route path="/pricing" component={Pricing} />
      <Route path="/blueprint" component={Blueprint} />
      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/apps" component={AdminApps} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
