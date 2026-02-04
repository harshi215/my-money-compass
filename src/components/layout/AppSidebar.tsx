import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart,
  Settings,
  LogOut,
  Wallet,
  PiggyBank,
  RefreshCw,
  FileUp,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Income', url: '/income', icon: TrendingUp },
  { title: 'Expenses', url: '/expenses', icon: TrendingDown },
  { title: 'Recurring', url: '/recurring', icon: RefreshCw },
  { title: 'Budgets', url: '/budgets', icon: Target },
  { title: 'Savings', url: '/savings', icon: PiggyBank },
  { title: 'Analytics', url: '/analytics', icon: PieChart },
  { title: 'Import Data', url: '/import', icon: FileUp },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="none" className="border-r-0 min-w-[240px] w-[240px]">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-sidebar-foreground">WealthWise</span>
            <span className="text-xs text-sidebar-foreground/60">Finance Tracker</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs font-medium tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="mb-4 bg-sidebar-border" />
        {user && (
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.email}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="default"
            className="justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-5 h-5" />
            <span className="ml-3">Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="default"
            className="justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Sign Out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
