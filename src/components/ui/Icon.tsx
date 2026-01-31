import {
  Home,
  BookOpen,
  Users,
  Bell,
  User,
  ArrowLeft,
  Share2,
  Clock,
  BookMarked,
  Play,
  CheckCircle,
  Lock,
  Heart,
  MessageCircle,
  X,
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Search,
  Image,
  Plus,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map Material Symbols names to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  // Navigation
  home: Home,
  school: BookOpen,
  explore: BookOpen,
  forum: Users,
  notifications: Bell,
  person: User,

  // Actions
  arrow_back_ios: ArrowLeft,
  arrow_back_ios_new: ArrowLeft,
  back_ios: ArrowLeft,
  share: Share2,
  close: X,
  settings: Settings,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  logout: LogOut,
  search: Search,
  image: Image,
  add: Plus,
  more_horiz: MoreHorizontal,
  more_vert: MoreHorizontal,

  // Media
  play_arrow: Play,
  play: Play,

  // Status
  check_circle: CheckCircle,
  check: CheckCircle2,
  lock: Lock,
  error: AlertCircle,

  // Content
  schedule: Clock,
  menu_book: BookMarked,
  book_2: BookOpen,
  favorite: Heart,
  chat_bubble: MessageCircle,

  // Post types
  lightbulb: Lightbulb,
  help: HelpCircle,

  // Materials
  description: FileText,
  pdf: FileText,
  video: Video,
  link: LinkIcon,
  download: Download,
  open_in_new: ExternalLink,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 24,
  className,
  filled = false,
  strokeWidth = 2,
}: IconProps) {
  const LucideIcon = iconMap[name.toLowerCase()] || iconMap[name.replace(/_/g, '')];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      className={cn(
        filled && 'fill-current',
        className
      )}
      strokeWidth={strokeWidth}
    />
  );
}

// Export individual icons for direct use
export {
  Home,
  BookOpen,
  Users,
  Bell,
  User,
  ArrowLeft,
  Share2,
  Clock,
  BookMarked,
  Play,
  CheckCircle,
  Lock,
  Heart,
  MessageCircle,
  X,
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Search,
  Image,
  Plus,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
  FileText,
  Video,
  LinkIcon as Link,
  Download,
  ExternalLink,
};
