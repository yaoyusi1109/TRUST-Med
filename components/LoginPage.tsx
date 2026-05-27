"use client";

import { useState } from "react";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";

// ── Types ──────────────────────────────────────────────────────────────────

type View = "entry" | "signin" | "register" | "pending";
type Region = "us" | "cn";

type RegisterForm = {
  region: Region;
  step: 1 | 2 | 3;
  // step 1
  role: string;
  // step 2 – US
  npi: string;
  doximityLinked: boolean;
  // step 2 – CN
  dxyLinked: boolean;
  licenseNumber: string;
  // shared step 2
  institution: string;
  specialty: string;
  // step 3
  name: string;
  email: string;
  password: string;
};

const INITIAL_FORM: RegisterForm = {
  region: "us",
  step: 1,
  role: "",
  npi: "",
  doximityLinked: false,
  dxyLinked: false,
  licenseNumber: "",
  institution: "",
  specialty: "",
  name: "",
  email: "",
  password: "",
};

// ── Copy ───────────────────────────────────────────────────────────────────

const US_ROLES = [
  { value: "attending",  label: "Attending Physician" },
  { value: "resident",   label: "Resident / Fellow" },
  { value: "student",    label: "Medical Student" },
  { value: "np_pa",      label: "NP / PA / CRNA" },
  { value: "nurse",      label: "Nurse (RN / BSN)" },
  { value: "researcher", label: "Clinical Researcher" },
];

const CN_ROLES = [
  { value: "attending",  label: "主治医师及以上" },
  { value: "resident",   label: "住院医师 / 规培医师" },
  { value: "student",    label: "医学生" },
  { value: "np_pa",      label: "护师 / 医师助理" },
  { value: "nurse",      label: "护士" },
  { value: "researcher", label: "临床研究员" },
];

const LICENSED_ROLES = new Set(["attending", "resident", "np_pa"]);

// ── Root component ─────────────────────────────────────────────────────────

export function LoginPage({ onAuth }: { onAuth: () => void }) {
  const { language } = useLanguage();
  const [view, setView] = useState<View>("entry");
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  function patch(fields: Partial<RegisterForm>) {
    setForm((f) => ({ ...f, ...fields }));
  }

  const isZh = language === "zh";

  // ── Entry screen ──────────────────────────────────────────────────────

  if (view === "entry") {
    return (
      <Shell>
        <LeftPanel />
        <RightPanel>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setView("signin")}
              className="w-full border border-primary bg-primary px-6 py-3.5 font-mono text-sm uppercase tracking-[0.14em] text-white hover:bg-background hover:text-primary transition-colors"
            >
              {isZh ? "登录" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => setView("register")}
              className="w-full border border-line bg-background px-6 py-3.5 font-mono text-sm uppercase tracking-[0.14em] text-ink hover:border-primary hover:text-primary transition-colors"
            >
              {isZh ? "申请访问权限" : "Apply for Access"}
            </button>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {isZh ? "演示模式" : "Demo mode"}
            </p>
            <button
              type="button"
              onClick={onAuth}
              className="w-full border border-line bg-wash px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-muted hover:border-primary hover:text-primary transition-colors"
            >
              {isZh ? "跳过登录（演示用途）" : "Skip authentication — demo only"}
            </button>
          </div>

          <AccessNote isZh={isZh} />
        </RightPanel>
      </Shell>
    );
  }

  // ── Sign-in screen ────────────────────────────────────────────────────

  if (view === "signin") {
    return (
      <Shell>
        <LeftPanel />
        <RightPanel>
          <BackButton onClick={() => setView("entry")} isZh={isZh} />
          <SectionHeading
            label={isZh ? "账号登录" : "Sign In"}
            sub={isZh ? "仅限已通过身份认证的医疗从业人员" : "Verified healthcare professionals only"}
          />

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => { e.preventDefault(); onAuth(); }}
          >
            <Field label={isZh ? "邮箱" : "Email"}>
              <input
                type="email"
                value={signinEmail}
                onChange={(e) => setSigninEmail(e.target.value)}
                placeholder={isZh ? "your@hospital.edu" : "you@hospital.edu"}
                className="input-base"
                required
              />
            </Field>
            <Field label={isZh ? "密码" : "Password"}>
              <input
                type="password"
                value={signinPassword}
                onChange={(e) => setSigninPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
                required
              />
            </Field>
            <button
              type="submit"
              className="w-full border border-primary bg-primary px-6 py-3 font-mono text-sm uppercase tracking-[0.14em] text-white hover:bg-background hover:text-primary transition-colors"
            >
              {isZh ? "登录" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 border-t border-line pt-4">
            <button
              type="button"
              onClick={onAuth}
              className="w-full border border-line bg-wash px-6 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted hover:border-primary hover:text-primary transition-colors"
            >
              {isZh ? "跳过登录（演示）" : "Skip — demo only"}
            </button>
          </div>
        </RightPanel>
      </Shell>
    );
  }

  // ── Pending screen ────────────────────────────────────────────────────

  if (view === "pending") {
    return (
      <Shell>
        <LeftPanel />
        <RightPanel>
          <div className="flex h-full flex-col justify-center py-4">
            <div className="mb-5 flex h-12 w-12 items-center justify-center border border-line bg-wash">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002D72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              {isZh ? "申请已提交" : "Application submitted"}
            </p>
            <h2 className="mt-2 font-display text-3xl text-primary">
              {isZh ? "正在审核您的资质" : "Credentials under review"}
            </h2>
            <p className="mt-4 leading-7 text-muted">
              {isZh
                ? "我们的团队将在 48 小时内核验您的医疗从业资质，并通过邮件通知您审核结果。"
                : "Our team will verify your healthcare credentials within 48 hours and notify you by email."}
            </p>
            <p className="mt-3 leading-7 text-muted">
              {isZh
                ? "如有紧急需求或问题，请联系 yyao85@jh.edu。"
                : "For urgent access or questions, contact yyao85@jh.edu."}
            </p>
            <div className="mt-6 border-t border-line pt-4">
              <button
                type="button"
                onClick={onAuth}
                className="border border-line bg-wash px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted hover:border-primary hover:text-primary transition-colors"
              >
                {isZh ? "进入演示模式" : "Continue in demo mode"}
              </button>
            </div>
          </div>
        </RightPanel>
      </Shell>
    );
  }

  // ── Register screen ───────────────────────────────────────────────────

  return (
    <Shell>
      <LeftPanel />
      <RightPanel>
        <BackButton
          onClick={() => {
            if (form.step === 1) setView("entry");
            else patch({ step: (form.step - 1) as 1 | 2 | 3 });
          }}
          isZh={isZh}
        />

        <StepIndicator step={form.step} isZh={isZh} />

        {form.step === 1 && (
          <RegisterStep1
            form={form}
            patch={patch}
            isZh={isZh}
            onNext={() => patch({ step: 2 })}
          />
        )}
        {form.step === 2 && (
          <RegisterStep2
            form={form}
            patch={patch}
            isZh={isZh}
            onNext={() => patch({ step: 3 })}
          />
        )}
        {form.step === 3 && (
          <RegisterStep3
            form={form}
            patch={patch}
            isZh={isZh}
            onSubmit={() => setView("pending")}
          />
        )}
      </RightPanel>
    </Shell>
  );
}

// ── Step 1: region + role ──────────────────────────────────────────────────

function RegisterStep1({
  form, patch, isZh, onNext
}: {
  form: RegisterForm;
  patch: (f: Partial<RegisterForm>) => void;
  isZh: boolean;
  onNext: () => void;
}) {
  const roles = form.region === "us" ? US_ROLES : CN_ROLES;

  return (
    <div className="mt-5 space-y-5">
      <SectionHeading
        label={isZh ? "选择地区与职业" : "Region & role"}
        sub={isZh ? "我们根据地区采用不同的身份认证方式" : "Verification method varies by jurisdiction"}
      />

      {/* Region toggle */}
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {isZh ? "所在地区" : "Region"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["us", "cn"] as Region[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => patch({ region: r, role: "", npi: "", doximityLinked: false, dxyLinked: false })}
              className={`border px-4 py-3 font-mono text-sm transition-colors ${
                form.region === r
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-background text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {r === "us" ? "🇺🇸  United States" : "🇨🇳  中国大陆"}
            </button>
          ))}
        </div>
      </div>

      {/* Role selection */}
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {isZh ? "职业类别" : "Professional role"}
        </p>
        <div className="space-y-1.5">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => patch({ role: r.value })}
              className={`flex w-full items-center gap-3 border px-4 py-2.5 text-left text-sm transition-colors ${
                form.role === r.value
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-background text-ink hover:bg-wash"
              }`}
            >
              <span
                className={`h-3 w-3 flex-shrink-0 rounded-full border-2 ${
                  form.role === r.value ? "border-white bg-white" : "border-muted bg-transparent"
                }`}
              />
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!form.role}
        onClick={onNext}
        className="w-full border border-primary bg-primary px-6 py-3 font-mono text-sm uppercase tracking-[0.14em] text-white hover:bg-background hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isZh ? "下一步" : "Continue"}
      </button>
    </div>
  );
}

// ── Step 2: credential verification ────────────────────────────────────────

function RegisterStep2({
  form, patch, isZh, onNext
}: {
  form: RegisterForm;
  patch: (f: Partial<RegisterForm>) => void;
  isZh: boolean;
  onNext: () => void;
}) {
  const isLicensed = LICENSED_ROLES.has(form.role);
  const canProceed = form.region === "us"
    ? (form.doximityLinked || !isLicensed || form.npi.trim().length >= 10)
    : (form.dxyLinked || form.institution.trim().length > 0);

  return (
    <div className="mt-5 space-y-5">
      <SectionHeading
        label={isZh ? "身份认证" : "Credential verification"}
        sub={
          form.region === "us"
            ? "Verify via Doximity or enter your NPI"
            : isZh ? "使用丁香园授权或手动填写认证信息" : "Verify via DXY or enter credentials manually"
        }
      />

      {form.region === "us" ? (
        <USCredentials form={form} patch={patch} isLicensed={isLicensed} isZh={isZh} />
      ) : (
        <CNCredentials form={form} patch={patch} isZh={isZh} />
      )}

      {/* Shared: institution + specialty */}
      <div className="space-y-3 border-t border-line pt-4">
        <Field label={isZh ? "所在机构 / 医院" : "Institution / Hospital"}>
          <input
            type="text"
            value={form.institution}
            onChange={(e) => patch({ institution: e.target.value })}
            placeholder={form.region === "us" ? "Johns Hopkins Hospital" : "南京鼓楼医院"}
            className="input-base"
          />
        </Field>
        <Field label={isZh ? "专科 / 科室" : "Specialty / Department"}>
          <input
            type="text"
            value={form.specialty}
            onChange={(e) => patch({ specialty: e.target.value })}
            placeholder={form.region === "us" ? "e.g. Internal Medicine" : "例如：内科"}
            className="input-base"
          />
        </Field>
      </div>

      <button
        type="button"
        disabled={!canProceed}
        onClick={onNext}
        className="w-full border border-primary bg-primary px-6 py-3 font-mono text-sm uppercase tracking-[0.14em] text-white hover:bg-background hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isZh ? "下一步" : "Continue"}
      </button>
    </div>
  );
}

function USCredentials({
  form, patch, isLicensed, isZh
}: {
  form: RegisterForm;
  patch: (f: Partial<RegisterForm>) => void;
  isLicensed: boolean;
  isZh: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Doximity OAuth button */}
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {isZh ? "推荐：Doximity 一键认证" : "Recommended: Doximity verification"}
        </p>
        {form.doximityLinked ? (
          <div className="flex items-center gap-3 border border-green-300 bg-green-50 px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm text-green-700">
              {isZh ? "已链接 Doximity 账户" : "Doximity profile linked"}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => patch({ doximityLinked: true })}
            className="flex w-full items-center justify-center gap-3 border border-[#0099CC] bg-white px-5 py-3 text-sm font-medium text-[#0077AA] hover:bg-[#F0FAFF] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#0099CC" />
              <text x="12" y="17" textAnchor="middle" fill="white" fontFamily="Georgia,serif" fontSize="13" fontWeight="bold">D</text>
            </svg>
            Continue with Doximity
          </button>
        )}
      </div>

      {/* NPI input */}
      {isLicensed && !form.doximityLinked && (
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            OR — Enter NPI number
          </p>
          <Field label="National Provider Identifier (NPI)">
            <input
              type="text"
              value={form.npi}
              onChange={(e) => patch({ npi: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="10-digit NPI"
              maxLength={10}
              className="input-base font-mono tracking-widest"
            />
            <p className="mt-1 font-mono text-[10px] text-muted">
              Look up your NPI at nppes.cms.hhs.gov
            </p>
          </Field>
        </div>
      )}
    </div>
  );
}

function CNCredentials({
  form, patch, isZh
}: {
  form: RegisterForm;
  patch: (f: Partial<RegisterForm>) => void;
  isZh: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* 丁香园 OAuth button */}
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {isZh ? "推荐：丁香园实名认证" : "Recommended: DXY verified identity"}
        </p>
        {form.dxyLinked ? (
          <div className="flex items-center gap-3 border border-green-300 bg-green-50 px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm text-green-700">
              {isZh ? "已通过丁香园身份认证" : "DXY identity verified"}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => patch({ dxyLinked: true })}
            className="flex w-full items-center justify-center gap-3 border border-[#00B050] bg-white px-5 py-3 text-sm font-medium text-[#007A35] hover:bg-[#F0FFF4] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#00B050" />
              <text x="12" y="16.5" textAnchor="middle" fill="white" fontFamily="sans-serif" fontSize="10" fontWeight="bold">丁香</text>
            </svg>
            {isZh ? "使用丁香园账号授权登录" : "Authorize with DXY account"}
          </button>
        )}
      </div>

      {/* Manual fallback */}
      {!form.dxyLinked && (
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {isZh ? "或手动填写认证信息" : "OR — Enter credentials manually"}
          </p>
          <Field label={isZh ? "医师执照编号（可选）" : "Medical license number (optional)"}>
            <input
              type="text"
              value={form.licenseNumber}
              onChange={(e) => patch({ licenseNumber: e.target.value })}
              placeholder={isZh ? "执照编号" : "License number"}
              className="input-base font-mono"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

// ── Step 3: contact info ────────────────────────────────────────────────────

function RegisterStep3({
  form, patch, isZh, onSubmit
}: {
  form: RegisterForm;
  patch: (f: Partial<RegisterForm>) => void;
  isZh: boolean;
  onSubmit: () => void;
}) {
  const canSubmit = form.name.trim() && form.email.trim() && form.password.length >= 8;

  return (
    <div className="mt-5 space-y-5">
      <SectionHeading
        label={isZh ? "创建账户" : "Create account"}
        sub={isZh ? "完成注册，等待资质审核" : "Submit your application for credential review"}
      />

      <form
        className="space-y-4"
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }}
      >
        <Field label={isZh ? "姓名" : "Full name"}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder={form.region === "us" ? "Dr. Jane Smith" : "张三"}
            className="input-base"
            required
          />
        </Field>
        <Field label={isZh ? "邮箱" : "Email"}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            placeholder={form.region === "us" ? "you@hospital.edu" : "your@hospital.edu.cn"}
            className="input-base"
            required
          />
        </Field>
        <Field label={isZh ? "设置密码（8位以上）" : "Password (min. 8 characters)"}>
          <input
            type="password"
            value={form.password}
            onChange={(e) => patch({ password: e.target.value })}
            placeholder="••••••••"
            className="input-base"
            minLength={8}
            required
          />
        </Field>

        <div className="border border-line bg-wash p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {isZh ? "数据使用说明" : "Data use notice"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {isZh
              ? "您的身份信息仅用于资质核验。评估数据将以匿名方式用于研究目的，不与您的个人身份关联。"
              : "Your identity information is used solely for credential verification. Evaluation data will be used anonymously for research and will not be linked to your identity."}
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full border border-accent bg-accent px-6 py-3 font-mono text-sm uppercase tracking-[0.14em] text-white hover:bg-background hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isZh ? "提交申请" : "Submit application"}
        </button>
      </form>
    </div>
  );
}

// ── Layout primitives ──────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {children}
    </div>
  );
}

function LeftPanel() {
  const { language } = useLanguage();
  const isZh = language === "zh";

  return (
    <div className="hidden flex-col justify-between bg-primary p-10 lg:flex lg:w-2/5">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
          {isZh ? "研究演示平台" : "Research demonstration"}
        </p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-white">
          TRUST-Med
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-white/60">
          {isZh
            ? "转化型真实世界医学 AI 安全测评"
            : "Translational Real-world Medical AI Safety Testing"}
        </p>
      </div>

      <div className="space-y-5">
        <div className="border-l-2 border-white/30 pl-5">
          <p className="font-display text-xl leading-8 text-white/90">
            {isZh
              ? "由真实医生评判，在美中两种临床规范下跨辖区测评医学大模型。"
              : "Evaluated by practicing clinicians. Tested across US and Chinese clinical standards."}
          </p>
        </div>

        <ul className="space-y-3">
          {(isZh ? [
            "医生直接评判模型输出",
            "量表辅助成对比较",
            "中美临床规范跨辖区分析",
          ] : [
            "Clinicians evaluate model outputs directly",
            "Rubric-augmented pairwise comparison",
            "Cross-jurisdictional US–China analysis",
          ]).map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-6 text-white/70">
              <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 bg-white/50" />
              {item}
            </li>
          ))}
        </ul>

        <div className="border-t border-white/20 pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
            {isZh ? "项目合作" : "Collaboration"}
          </p>
          <p className="mt-2 text-sm text-white/60">
            Johns Hopkins University — CSSE
          </p>
          <p className="text-sm text-white/60">
            {isZh ? "南京大学人工智能学院" : "Nanjing University — School of AI"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RightPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-line px-6">
        <span className="font-display text-lg text-primary">TRUST-Med</span>
        <LanguageToggle compact />
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto p-6 lg:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

// ── Small shared components ────────────────────────────────────────────────

function BackButton({ onClick, isZh }: { onClick: () => void; isZh: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted hover:text-primary transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {isZh ? "返回" : "Back"}
    </button>
  );
}

function SectionHeading({ label, sub }: { label: string; sub: string }) {
  return (
    <div>
      <h2 className="font-display text-3xl text-primary">{label}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{sub}</p>
    </div>
  );
}

function StepIndicator({ step, isZh }: { step: number; isZh: boolean }) {
  const labels = isZh
    ? ["选择地区与职业", "身份认证", "创建账户"]
    : ["Region & role", "Credentials", "Account"];

  return (
    <div className="mb-1 flex items-center gap-1">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-1">
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center font-mono text-[10px] ${
                done ? "bg-primary text-white" :
                active ? "border-2 border-primary text-primary" :
                "border border-line text-muted"
              }`}
            >
              {done ? "✓" : n}
            </div>
            <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${active ? "text-primary" : "text-muted"}`}>
              {label}
            </span>
            {i < labels.length - 1 && (
              <span className="mx-1 text-line">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function AccessNote({ isZh }: { isZh: boolean }) {
  return (
    <div className="mt-6 border border-line bg-wash p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {isZh ? "访问须知" : "Access policy"}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">
        {isZh
          ? "TRUST-Med 仅对执业医师、住院医师、医学生、护理人员及临床研究人员开放。注册时需提供可核验的从业资质。"
          : "TRUST-Med is open to licensed physicians, residents, medical students, nurses, and clinical researchers. Verifiable credentials are required at registration."}
      </p>
    </div>
  );
}
