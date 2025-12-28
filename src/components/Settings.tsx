import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  LogOut,
  Moon,
  Sun,
  Languages,
  Palette,
  Loader2,
  Key,
  Code,
  Eye,
  FileText,
  AlertCircle,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api as _api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Toast, ToastContainer } from "@/components/ui/toast";
import { ClaudeAuthSettings } from "./ClaudeAuthSettings";
import { PlanningCompleteModal, PreviewWelcomeModal, EnvironmentSetupStep } from "./help";
import { useTheme, useTranslation } from "@/hooks";
import { Monitor } from "@/lib/icons";
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
  | "account"
  | "dev-tools";

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: React.ElementType;
  category: "general" | "account" | "dev";
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

  // Dev tools modal states
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEnvironmentSetup, setShowEnvironmentSetup] = useState(false);
  const [showEnvironmentSetupMissing, setShowEnvironmentSetupMissing] = useState(false);

  // Auth store
  const { user, logout } = useAuthStore();

  // Navigation items - AI와 General을 합쳐서 "일반" 카테고리로 통합
  const navItems: NavItem[] = [
    { id: "appearance", label: t('settings.simple.appearance'), icon: Palette, category: "general" },
    { id: "ai-auth", label: t('settings.claudeAuth.title'), icon: Key, category: "general" },
    { id: "account", label: t('settings.account.title'), icon: User, category: "account" },
    ...(isDev ? [{ id: "dev-tools" as const, label: "개발자 도구", icon: Code, category: "dev" as const }] : []),
  ];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Settings loaded
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
                <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'ko')}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('language.en')}</SelectItem>
                    <SelectItem value="ko">{t('language.ko')}</SelectItem>
                  </SelectContent>
                </Select>
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

            </div>
          </div>
        );

      case "ai-auth":
        return (
          <ClaudeAuthSettings
            setToast={setToast}
          />
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

                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('settings.account.name')}</p>
                    <p className="text-sm font-medium">{user.name}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{user.email}</p>
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
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => setShowEnvironmentSetup(true)}
                  >
                    <Monitor className="h-4 w-4 text-purple-500" />
                    <div className="text-left">
                      <div className="font-medium">환경 설정 화면 (실제)</div>
                      <div className="text-xs text-muted-foreground">EnvironmentSetupStep - 실제 환경 체크</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => setShowEnvironmentSetupMissing(true)}
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <div className="text-left">
                      <div className="font-medium">환경 설정 화면 (미설치)</div>
                      <div className="text-xs text-muted-foreground">EnvironmentSetupStep - 모두 미설치 시뮬레이션</div>
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
      {/* Full Width Container */}
      <div className="h-full flex">
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
          {/* Environment Setup Modal */}
          {showEnvironmentSetup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowEnvironmentSetup(false)}
              />
              <div className="relative w-full max-w-lg mx-4 bg-background rounded-2xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">환경 설정 테스트 (실제)</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnvironmentSetup(false)}
                  >
                    닫기
                  </Button>
                </div>
                <div className="overflow-y-auto">
                  <EnvironmentSetupStep
                    onComplete={() => {
                      setShowEnvironmentSetup(false);
                      setToast({ message: '환경 설정 완료!', type: 'success' });
                    }}
                    onSkip={() => {
                      setShowEnvironmentSetup(false);
                      setToast({ message: '건너뛰기 클릭됨', type: 'success' });
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {/* Environment Setup Modal - Missing Dependencies Simulation */}
          {showEnvironmentSetupMissing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowEnvironmentSetupMissing(false)}
              />
              <div className="relative w-full max-w-lg mx-4 bg-background rounded-2xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">환경 설정 테스트 (미설치 시뮬레이션)</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnvironmentSetupMissing(false)}
                  >
                    닫기
                  </Button>
                </div>
                <div className="overflow-y-auto">
                  <EnvironmentSetupStep
                    onComplete={() => {
                      setShowEnvironmentSetupMissing(false);
                      setToast({ message: '환경 설정 완료!', type: 'success' });
                    }}
                    onSkip={() => {
                      setShowEnvironmentSetupMissing(false);
                      setToast({ message: '건너뛰기 클릭됨', type: 'success' });
                    }}
                    mockStatus={{
                      platform: "macos",
                      all_ready: false,
                      package_manager: null,
                      nodejs: {
                        name: "nodejs",
                        is_installed: false,
                        meets_minimum: false,
                        version: null,
                        source: "not_found",
                        path: null,
                        minimum_version: "18.0.0",
                      },
                      git: {
                        name: "git",
                        is_installed: false,
                        meets_minimum: false,
                        version: null,
                        source: "not_found",
                        path: null,
                        minimum_version: "2.0.0",
                      },
                      claude_code: {
                        name: "claude-code",
                        is_installed: false,
                        meets_minimum: false,
                        version: null,
                        source: "not_found",
                        path: null,
                        minimum_version: "1.0.0",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
