import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Crown,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  Languages,
  Palette,
  Wifi,
  Loader2,
  Key,
  Code,
  Eye,
  FileText,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Toast, ToastContainer } from "@/components/ui/toast";
import { ProxySettings } from "./ProxySettings";
import { ClaudeAuthSettings } from "./ClaudeAuthSettings";
import { PlanningCompleteModal, PreviewWelcomeModal } from "./help";
import { useTheme, useTrackEvent, useTranslation } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";
import { SUPPORT_CONFIG } from "@/constants/support";

const isDev = import.meta.env.DEV;

interface SettingsProps {
  className?: string;
  onBack?: () => void;
}

type SettingsSection =
  | "appearance"
  | "ai-auth"
  | "ai-proxy"
  | "account"
  | "subscription"
  | "dev-tools";

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: React.ElementType;
  category: "general" | "ai" | "account" | "dev";
}

export const Settings: React.FC<SettingsProps> = ({
  className,
}) => {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Theme hook
  const { theme, toggleTheme } = useTheme();

  // Translation hook
  const { t, language, setLanguage } = useTranslation();

  const trackEvent = useTrackEvent();


  // Startup intro preference
  const [startupIntroEnabled, setStartupIntroEnabled] = useState(true);

  // Dev tools modal states
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Auth store
  const { user, logout, getUserSettings, updateUserSetting } = useAuthStore();

  // Navigation items
  const navItems: NavItem[] = [
    { id: "appearance", label: t('settings.simple.appearance'), icon: Palette, category: "general" },
    { id: "ai-auth", label: t('settings.claudeAuth.title'), icon: Key, category: "ai" },
    { id: "ai-proxy", label: t('settings.ai.proxy'), icon: Wifi, category: "ai" },
    { id: "account", label: t('settings.account.title'), icon: User, category: "account" },
    { id: "subscription", label: t('settings.account.subscription'), icon: Crown, category: "account" },
    ...(isDev ? [{ id: "dev-tools" as const, label: "개발자 도구", icon: Code, category: "dev" as const }] : []),
  ];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Load startup intro setting
      const startupPref = await api.getSetting('startup_intro_enabled');
      setStartupIntroEnabled(startupPref === null ? true : startupPref === 'true');

      // Try to load from server
      try {
        const userSettings = await getUserSettings();
        if (userSettings && typeof userSettings === 'object') {
          if (userSettings.startup_intro_enabled !== undefined) {
            setStartupIntroEnabled(userSettings.startup_intro_enabled === true);
          }
        }
      } catch (serverError) {
        console.warn('Failed to load from server, trying local:', serverError);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case "appearance":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('settings.simple.appearance')}</h3>
                <p className="text-sm text-muted-foreground">{t('settings.simple.appearanceDesc')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Language Selector */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">{t('settings.simple.language')}</Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t('settings.simple.languageDesc')}
                    </p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ko')}
                  className="h-10 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="en">{t('language.en')}</option>
                  <option value="ko">{t('language.ko')}</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label className="text-base font-medium">{t('settings.simple.theme')}</Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {theme === 'dark' ? t('settings.simple.themeDark') : t('settings.simple.themeLight')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>

              {/* Startup Animation */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">{t('settings.simple.welcomeAnimation')}</Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t('settings.simple.welcomeAnimationDesc')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={startupIntroEnabled}
                  onCheckedChange={async (checked) => {
                    setStartupIntroEnabled(checked);
                    try {
                      await updateUserSetting('startup_intro_enabled', checked);
                      await api.saveSetting('startup_intro_enabled', checked ? 'true' : 'false');
                      trackEvent.settingsChanged('startup_intro_enabled', checked);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                />
              </div>

            </div>
          </div>
        );

      case "ai-auth":
        return (
          <ClaudeAuthSettings
            setToast={setToast}
          />
        );

      case "ai-proxy":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-cyan-500/10">
                <Wifi className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('settings.ai.proxy')}</h3>
                <p className="text-sm text-muted-foreground">{t('settings.ai.proxyDesc')}</p>
              </div>
            </div>

            <ProxySettings
              setToast={setToast}
              onChange={async (hasChanges, _getSettings, save) => {
                if (hasChanges && save) {
                  try {
                    await save();
                  } catch (err) {
                    console.error("Failed to auto-save proxy settings:", err);
                  }
                }
              }}
            />
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('settings.account.title')}</h3>
              </div>
            </div>

            {user && (
              <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                  <User size={28} className="text-primary" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('settings.account.name')}</p>
                      <p className="text-sm font-medium">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('settings.account.email')}</p>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/10">
                    <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{t('settings.account.logout')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.account.logoutDescription')}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={logout}
                  variant="destructive"
                  size="default"
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  {t('settings.account.logout')}
                </Button>
              </div>
            </div>
          </div>
        );

      case "subscription":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-yellow-500/10">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t('settings.account.subscription')}</h3>
              </div>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown size={18} className="text-yellow-500" />
                  <span className="font-medium">{t('settings.account.currentPlan')}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-muted border border-border">
                  <span className="text-sm font-medium">{t('settings.account.comingSoon')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {t('settings.account.proDescription')}
                </p>
              </div>
            </div>
          </div>
        );

      case "dev-tools":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-orange-500/10">
                <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">개발자 도구</h3>
                <p className="text-sm text-muted-foreground">개발 환경에서만 표시됩니다</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  팝업 테스트
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  각 버튼을 클릭하면 해당 팝업을 미리 볼 수 있습니다.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => setShowPlanningModal(true)}
                  >
                    <FileText className="h-4 w-4 text-green-500" />
                    <div className="text-left">
                      <div className="font-medium">기획완료 팝업</div>
                      <div className="text-xs text-muted-foreground">PlanningCompleteModal</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => setShowPreviewModal(true)}
                  >
                    <Eye className="h-4 w-4 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">프리뷰 웰컴 팝업</div>
                      <div className="text-xs text-muted-foreground">PreviewWelcomeModal</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ 이 섹션은 개발 모드(DEV)에서만 표시됩니다. 프로덕션 빌드에서는 자동으로 숨겨집니다.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("h-full overflow-y-auto", className)}>
      {/* Centered Container */}
      <div className="max-w-5xl mx-auto h-full flex">
        {/* Left Navigation */}
        <div className="w-56 flex-shrink-0 border-r bg-muted/20 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b">
            <h1 className="text-lg font-bold">{t('settings.title')}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('settings.subtitle')}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-5">
            {/* General Section */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {t('settings.tab.general')}
              </p>
              <div className="space-y-0.5">
                {navItems.filter(item => item.category === "general").map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Section */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {t('settings.tab.ai')}
              </p>
              <div className="space-y-0.5">
                {navItems.filter(item => item.category === "ai").map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Section */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {t('settings.tab.account')}
              </p>
              <div className="space-y-0.5">
                {navItems.filter(item => item.category === "account").map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dev Section (only in development) */}
            {isDev && navItems.some(item => item.category === "dev") && (
              <div>
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2 px-2">
                  DEV
                </p>
                <div className="space-y-0.5">
                  {navItems.filter(item => item.category === "dev").map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                        activeSection === item.id
                          ? "bg-orange-500 text-white"
                          : "text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Right Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="p-6">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                {renderSectionContent()}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </ToastContainer>

      {/* Dev Tools Modals */}
      {isDev && (
        <>
          <PlanningCompleteModal
            isOpen={showPlanningModal}
            onClose={() => setShowPlanningModal(false)}
            onProceedWithAI={() => {
              setShowPlanningModal(false);
              setToast({ message: '개발문서 작성하기 클릭됨', type: 'success' });
            }}
            onContactSupport={() => {
              window.open(SUPPORT_CONFIG.KAKAO_CHANNEL_URL, '_blank');
              setShowPlanningModal(false);
            }}
          />
          <PreviewWelcomeModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            onViewPreview={() => {
              setShowPreviewModal(false);
              setToast({ message: '프리뷰 확인하기 클릭됨', type: 'success' });
            }}
            onContactSupport={() => {
              window.open(SUPPORT_CONFIG.KAKAO_CHANNEL_URL, '_blank');
              setShowPreviewModal(false);
            }}
          />
        </>
      )}
    </div>
  );
};
