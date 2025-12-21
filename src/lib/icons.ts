/**
 * Icon migration layer: lucide-react → hugeicons
 * Provides type-safe icon exports with lucide-compatible names
 */

import * as React from 'react';
import {
  // Basic shapes and controls
  Cancel01Icon,
  Tick02Icon,
  CircleIcon,
  SquareIcon,

  // Arrows and chevrons
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,

  // Checkmarks and status
  CheckmarkCircle01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  AlertDiamondIcon,
  InformationCircleIcon,
  CancelCircleIcon,

  // Search and navigation
  Search01Icon,

  // Code and files
  CodeIcon,
  FileAddIcon,
  File02Icon,
  FolderOpenIcon,
  FileScriptIcon,
  Folder01Icon,
  QuestionIcon,

  // Development
  ConsoleIcon,
  PackageIcon,
  PackageAddIcon,

  // UI and editing
  StarsIcon,
  FlashIcon,
  GitBranchIcon,
  FileEditIcon,
  Edit01Icon,
  Edit02Icon,
  Loading03Icon,

  // Users and social
  UserMultiple02Icon,
  UserIcon,
  ChatBotIcon,

  // System
  CpuIcon,
  CloudServerIcon,
  Wrench01Icon,
  FingerPrintIcon,
  Settings02Icon,
  Settings03Icon,
  SquareArrowDataTransferDiagonalIcon,

  // Navigation and layout
  FolderSearchIcon,
  ListViewIcon,
  GridViewIcon,

  // Authentication
  Logout01Icon,
  LockIcon,

  // Documentation
  Book02Icon,
  BookOpen01Icon,

  // Network and web
  GlobeIcon,
  Globe02Icon,
  AiNetworkIcon,
  LinkSquare02Icon,

  // Tasks and organization
  TaskDone01Icon,
  TaskAdd01Icon,

  // Time and activity
  Clock01Icon,
  Calendar01Icon,
  Activity01Icon,
  WorkHistoryIcon,

  // Media and playback
  PlayIcon,
  PlayCircleIcon,
  StopIcon,
  VolumeMute01Icon,

  // Actions
  Download01Icon,
  Upload01Icon,
  Copy01Icon,
  FloppyDiskIcon,
  Delete02Icon,
  Add01Icon,
  Remove01Icon,
  Maximize01Icon,
  Minimize01Icon,
  RefreshIcon,
  RotateLeft01Icon,

  // Communication
  BubbleChatIcon,

  // Data and charts
  Analytics01Icon,
  DollarCircleIcon,

  // Security
  Shield01Icon,

  // Command
  CommandIcon,

  // Storage
  HardDriveIcon,

  // Social and branding
  Github01Icon,

  // Misc
  CrownIcon,
  MoreVerticalIcon,
  SortingAZ01Icon,

  // Phase 5 Batch 2A - Device and UI icons
  ComputerIcon,
  SmartPhone01Icon,
  Tablet01Icon,
  LaptopIcon,
  Rotate01Icon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
  CursorPointer01Icon,
  EyeIcon,

  // Phase 5 Batch 2C - Additional missing icons
  AnchorPointIcon,
  Atom01Icon,
  Award01Icon,
  BatteryFullIcon,
  BulbIcon,
  Notification01Icon,
  BluetoothIcon,
  Bookmark01Icon,
  DeliveryBox01Icon,
  AiBrain01Icon,
  Briefcase01Icon,
  PaintBrush01Icon,
  Bug01Icon,
  Building01Icon,
  Building02Icon,
  Calculator01Icon,
  Camera01Icon,
  AiCloud01Icon,
  CloudIcon,
  Coffee01Icon,
  Settings01Icon,
  Compass01Icon,
  CreditCardIcon,
  Target01Icon,
  Database01Icon,
  DiceFaces01Icon,
  GitCompareIcon,
  AiDnaIcon,
  ViewOffIcon,
  Image01Icon,
  Film01Icon,
  Flag01Icon,
  FireIcon,
  FlashIcon as FlashIconAlt,
  GameIcon,
  GiftIcon,
  GitForkIcon,
  HeadphonesIcon,
  FavouriteIcon,
  HelpCircleIcon,
  Home01Icon,
  Image02Icon,
  Key01Icon,
  LanguageSkillIcon,
  Layers01Icon,
  Layout01Icon,
  Leaf01Icon,
  Link01Icon,
  Mail01Icon,
  MapsIcon,
  Medal01Icon,
  Megaphone01Icon,
  Menu01Icon,
  Mic01Icon,
  Moon02Icon,
  MountainIcon,
  MusicNote01Icon,
  PaintBrush02Icon,
  PaintBoardIcon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  AttachmentIcon,
  PencilEdit01Icon,
  CallIcon,
  PieChartIcon,
  Location01Icon,
  Radio01Icon as PodcastIconAlt,
  PuzzleIcon,
  Radio01Icon,
  InvoiceIcon,
  Rocket01Icon,
  Scissor01Icon,
  SentIcon,
  Share01Icon,
  SmileIcon,
  SnowIcon,
  StarIcon,
  Sun01Icon,
  Sword01Icon,
  Tag01Icon,
  Target02Icon,
  ThumbsUpIcon,
  Tree01Icon,
  AnalyticsDownIcon,
  AnalyticsUpIcon,
  Award01Icon as TrophyIconAlt,
  TextFontIcon,
  UmbrellaIcon,
  Video01Icon,
  Mail01Icon as VoicemailIconAlt,
  Wallet01Icon,
  MagicWand01Icon,
  SmartWatch01Icon,
  WavingHand01Icon,
  Wifi01Icon,
  WindPowerIcon,
  FilterIcon,
  TableIcon,
  Delete01Icon,
} from 'hugeicons-react';

// Export with lucide-compatible names
export {
  // Basic controls
  Cancel01Icon as X,
  Tick02Icon as Check,
  CircleIcon as Circle,
  SquareIcon as Square,

  // Arrows and chevrons
  ArrowRight01Icon as ChevronRight,
  ArrowLeft01Icon as ChevronLeft,
  ArrowLeft01Icon as ArrowLeft,
  ArrowRight01Icon as ArrowRight,
  ArrowDown01Icon as ChevronDown,
  ArrowUp01Icon as ChevronUp,
  ArrowUpDownIcon as ArrowUpDown,

  // Status and alerts
  CheckmarkCircle01Icon as CheckCircle,
  CheckmarkCircle02Icon as CheckCircle2,
  AlertCircleIcon as AlertCircle,
  AlertDiamondIcon as AlertTriangle,
  InformationCircleIcon as Info,
  CancelCircleIcon as XCircle,

  // Search
  Search01Icon as Search,

  // Code and files
  CodeIcon as Code,
  CodeIcon as Code2,  // Use same icon as Code
  FileAddIcon as FilePlus,
  File02Icon as FileText,
  File02Icon as File,
  FolderOpenIcon as FolderOpen,
  FileScriptIcon as FileCode,
  Folder01Icon as Folder,
  File02Icon as FileJson,  // Fallback to File02Icon
  QuestionIcon as FileQuestion,

  // Development
  ConsoleIcon as Terminal,
  PackageIcon as Package2,
  PackageAddIcon as Package,

  // UI effects
  StarsIcon as Sparkles,
  FlashIcon as Zap,

  // Version control
  GitBranchIcon as GitBranch,

  // Editing
  FileEditIcon as FileEdit,
  Edit01Icon as Edit,
  Edit02Icon as Edit2,
  Edit02Icon as Edit3,
  Loading03Icon as Loader2,

  // Users
  UserMultiple02Icon as Users,
  UserIcon as User,
  ChatBotIcon as Bot,

  // System
  CpuIcon as Cpu,
  CloudServerIcon as Server,
  Wrench01Icon as Wrench,
  FingerPrintIcon as Fingerprint,
  Settings02Icon as Settings,
  Settings03Icon as Settings2,
  SquareArrowDataTransferDiagonalIcon as CheckSquare,

  // Navigation
  FolderSearchIcon as FolderSearch,
  ListViewIcon as List,
  GridViewIcon as LayoutGrid,
  ListViewIcon as LayoutList,

  // Authentication
  Logout01Icon as LogOut,
  LockIcon as Lock,

  // Books
  Book02Icon as Book,
  BookOpen01Icon as BookOpen,

  // Web
  GlobeIcon as Globe,
  Globe02Icon as Globe2,
  AiNetworkIcon as Network,
  LinkSquare02Icon as ExternalLink,

  // Tasks
  TaskDone01Icon as ListChecks,
  TaskAdd01Icon as ListPlus,

  // Time
  Clock01Icon as Clock,
  Calendar01Icon as Calendar,
  Activity01Icon as Activity,
  WorkHistoryIcon as History,

  // Media
  PlayIcon as Play,
  PlayCircleIcon as PlayCircle,
  StopIcon as StopCircle,
  VolumeMute01Icon as Volume2,
  VolumeMute01Icon as VolumeX,

  // Actions
  Download01Icon as Download,
  Upload01Icon as Upload,
  Copy01Icon as Copy,
  FloppyDiskIcon as Save,
  Delete02Icon as Trash2,
  Add01Icon as Plus,
  Remove01Icon as Minus,
  Maximize01Icon as Maximize2,
  Minimize01Icon as Minimize2,
  RefreshIcon as RefreshCw,
  RotateLeft01Icon as RotateCcw,

  // Communication
  BubbleChatIcon as MessageSquare,

  // Data
  Analytics01Icon as BarChart,
  Analytics01Icon as BarChart3,
  DollarCircleIcon as Hash,  // Fallback icon for Hash
  DollarCircleIcon as DollarSign,

  // Security
  Shield01Icon as Shield,

  // Command
  CommandIcon as Command,

  // Storage
  HardDriveIcon as HardDrive,

  // Social
  Github01Icon as Github,

  // Misc
  CrownIcon as Crown,
  MoreVerticalIcon as MoreVertical,
  SortingAZ01Icon as SortAsc,

  // Phase 5 Batch 2A - Device and UI icons
  ComputerIcon as Monitor,
  SmartPhone01Icon as Smartphone,
  Tablet01Icon as Tablet,
  LaptopIcon as Laptop,
  Rotate01Icon as RotateCw,
  ZoomInAreaIcon as ZoomIn,
  ZoomOutAreaIcon as ZoomOut,
  CursorPointer01Icon as MousePointer2,
  EyeIcon as Eye,
  Maximize01Icon as Maximize,

  // Import/Export (using existing icons as fallback)
  Download01Icon as Import,

  // Phase 5 Batch 2C - Additional missing icon exports
  AnchorPointIcon as Anchor,
  Atom01Icon as Atom,
  Award01Icon as Award,
  BatteryFullIcon as Battery,
  BulbIcon as Beaker,
  Notification01Icon as Bell,
  BluetoothIcon as Bluetooth,
  Bookmark01Icon as Bookmark,
  DeliveryBox01Icon as Boxes,
  AiBrain01Icon as Brain,
  Briefcase01Icon as Briefcase,
  PaintBrush01Icon as Brush,
  Bug01Icon as Bug,
  Building01Icon as Building,
  Building02Icon as Building2,
  Calculator01Icon as Calculator,
  Camera01Icon as Camera,
  AiCloud01Icon as Cloud,
  CloudIcon as CloudRain,
  Coffee01Icon as Coffee,
  Settings01Icon as Cog,
  Compass01Icon as Compass,
  CreditCardIcon as CreditCard,
  Target01Icon as Crosshair,
  Database01Icon as Database,
  DiceFaces01Icon as Dice1,
  GitCompareIcon as Diff,
  AiDnaIcon as Dna,
  ViewOffIcon as EyeOff,
  Image01Icon as FileImage,
  Film01Icon as Film,
  Flag01Icon as Flag,
  FireIcon as Flame,
  FlashIconAlt as Flashlight,
  GameIcon as Gamepad2,
  GiftIcon as Gift,
  GitForkIcon as GitFork,
  HeadphonesIcon as Headphones,
  FavouriteIcon as Heart,
  HelpCircleIcon as HelpCircle,
  Home01Icon as Home,
  Image02Icon as Image,
  Key01Icon as Key,
  LanguageSkillIcon as Languages,
  Layers01Icon as Layers,
  Layout01Icon as Layout,
  Leaf01Icon as Leaf,
  BulbIcon as Lightbulb,
  Link01Icon as Link,
  Mail01Icon as Mail,
  MapsIcon as Map,
  Medal01Icon as Medal,
  Megaphone01Icon as Megaphone,
  Menu01Icon as Menu,
  BubbleChatIcon as MessageCircle,
  Mic01Icon as Mic,
  Moon02Icon as Moon,
  MountainIcon as Mountain,
  MusicNote01Icon as Music,
  PaintBrush02Icon as Paintbrush,
  PaintBoardIcon as Palette,
  SidebarLeft01Icon as PanelRightClose,
  SidebarRight01Icon as PanelRightOpen,
  AttachmentIcon as Paperclip,
  PencilEdit01Icon as PenTool,
  CallIcon as Phone,
  PieChartIcon as PieChart,
  Location01Icon as Pin,
  PodcastIconAlt as Podcast,
  PuzzleIcon as Puzzle,
  Radio01Icon as Radio,
  InvoiceIcon as Receipt,
  Rocket01Icon as Rocket,
  Scissor01Icon as Scissors,
  SentIcon as Send,
  Share01Icon as Share,
  SmileIcon as Smile,
  SnowIcon as Snowflake,
  StarIcon as Star,
  Sun01Icon as Sun,
  Sword01Icon as Swords,
  Tag01Icon as Tag,
  Target02Icon as Target,
  ThumbsUpIcon as ThumbsUp,
  Tree01Icon as TreePine,
  AnalyticsDownIcon as TrendingDown,
  AnalyticsUpIcon as TrendingUp,
  TrophyIconAlt as Trophy,
  TextFontIcon as Type,
  UmbrellaIcon as Umbrella,
  Video01Icon as Video,
  VoicemailIconAlt as Voicemail,
  Wallet01Icon as Wallet,
  MagicWand01Icon as Wand2,
  SmartWatch01Icon as Watch,
  WavingHand01Icon as Waves,
  Wifi01Icon as Wifi,
  WindPowerIcon as Wind,
  FilterIcon as Filter,
  TableIcon as Table,
  Delete01Icon as Trash,
};

export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

// Export type for icon components (compatible with LucideIcon)
// Hugeicons use SVGProps with additional size prop
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
}

export type IconComponent = React.ComponentType<IconProps>;

// Compatibility export for LucideIcon type
export type LucideIcon = IconComponent;
