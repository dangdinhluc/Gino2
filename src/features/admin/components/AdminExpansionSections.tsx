import { type ReactNode } from 'react';
import { Archive, Bot, CheckCircle2, FileText, KeyRound, Layers3, Package, ShieldAlert, Sparkles, type LucideIcon } from 'lucide-react';
import {
  type AdminAiPrompt,
  type AdminApiKeyRecord,
  type AdminCourseLesson,
  type AdminCourseModule,
  type AdminLessonAsset,
  type AdminLessonExercise,
  type AdminPackage,
} from '@/src/data/admin';
import { EntitySection, KpiCard, MobileEntityList, ProgressBar, StatusBadge } from '@/src/features/admin/components/AdminDashboardPrimitives';
import {
  average,
  formatCurrency,
  formatDate,
  getCourseTitle,
  getProgressTone,
  getStatusLabel,
  type DetailEntity,
} from '@/src/features/admin/lib/adminDashboardModel';

interface CourseContentSectionProps {
  modules: AdminCourseModule[];
  lessons: AdminCourseLesson[];
  assets: AdminLessonAsset[];
  exercises: AdminLessonExercise[];
  onSelect: (entity: DetailEntity) => void;
  onMockAction: (message: string) => void;
}

interface PackagesSectionProps {
  items: AdminPackage[];
  onSelect: (entity: DetailEntity) => void;
  onMockAction: (message: string) => void;
}

interface AiPromptsSectionProps {
  items: AdminAiPrompt[];
  onSelect: (entity: DetailEntity) => void;
  onMockAction: (message: string) => void;
}

interface ApiKeysSectionProps {
  items: AdminApiKeyRecord[];
  onSelect: (entity: DetailEntity) => void;
  onMockAction: (message: string) => void;
}

export function CourseContentSection({ modules, lessons, assets, exercises, onSelect, onMockAction }: CourseContentSectionProps) {
  const draftLessons = lessons.filter((lesson) => lesson.status === 'draft').length;
  const missingAssetLessons = lessons.filter((lesson) => lesson.missingAssets.length > 0).length;
  const readyToPublish = lessons.filter((lesson) => lesson.status !== 'published' && lesson.qualityScore >= 80 && lesson.missingAssets.length === 0).length;

  return (
    <EntitySection
      title="Tạo & quản lý nội dung khóa học"
      description="Quản lý module, lesson, asset, exercise và checklist readiness trước khi publish."
      count={lessons.length + modules.length}
      aside={
        <ActionRow
          actions={[
            ['Tạo lesson', 'Đã mở composer tạo lesson demo'],
            ['Thêm từ vựng', 'Đã thêm vocabulary drill demo'],
            ['Thêm quiz', 'Đã thêm quiz mock'],
            ['Attach audio', 'Đã attach audio prompt demo'],
          ]}
          onMockAction={onMockAction}
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Draft lessons" value={`${draftLessons}`} detail="Cần hoàn thiện trước publish" icon={Archive} trend="-2" tone="orange" />
        <KpiCard label="Missing assets" value={`${missingAssetLessons}`} detail={`${assets.length} asset đang tracking`} icon={FileText} trend="-1" tone="red" />
        <KpiCard label="Quality score" value={`${average(lessons.map((lesson) => lesson.qualityScore))}%`} detail="Trung bình lesson hiện tại" icon={CheckCircle2} trend="+5%" tone="green" />
        <KpiCard label="Ready to publish" value={`${readyToPublish}`} detail={`${exercises.length} exercise mock`} icon={Sparkles} trend="+3" tone="blue" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div>
          <MobileEntityList
            items={lessons}
            getKey={(lesson) => lesson.id}
            getTitle={(lesson) => lesson.title}
            getSubtitle={(lesson) => `${getCourseTitle(lesson.courseId)} · ${getStatusLabel(lesson.type)}`}
            getMeta={(lesson) => (
              <div className="space-y-2">
                <StatusBadge value={lesson.status} />
                <ProgressBar value={lesson.qualityScore} tone={getProgressTone(lesson.qualityScore)} />
              </div>
            )}
            onSelect={(lesson) => onSelect({ type: 'course-lesson', item: lesson })}
          />
          <div className="hidden overflow-hidden rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0E8DC] text-xs uppercase tracking-[0.14em] text-[#5F6B7C]">
                <tr>
                  <th className="px-4 py-4">Lesson</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Assets</th>
                  <th className="px-4 py-4">Exercises</th>
                  <th className="px-4 py-4">Quality</th>
                  <th className="px-4 py-4">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4D8C9]">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="transition hover:bg-[#F8F2EA]">
                    <td className="px-4 py-4">
                      <button type="button" onClick={() => onSelect({ type: 'course-lesson', item: lesson })} className="text-left">
                        <span className="block font-black text-[#172033]">{lesson.title}</span>
                        <span className="text-xs font-semibold text-[#5F6B7C]">{getCourseTitle(lesson.courseId)} · updated {formatDate(lesson.updatedAt)}</span>
                      </button>
                    </td>
                    <td className="px-4 py-4"><StatusBadge value={lesson.type} /></td>
                    <td className="px-4 py-4"><StatusBadge value={lesson.status} /></td>
                    <td className="px-4 py-4 font-bold text-[#172033]">{lesson.assetCount}</td>
                    <td className="px-4 py-4 font-bold text-[#172033]">{lesson.exerciseCount}</td>
                    <td className="px-4 py-4 min-w-36">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={lesson.qualityScore} tone={getProgressTone(lesson.qualityScore)} />
                        <span className="w-10 text-right font-bold text-[#172033]">{lesson.qualityScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#5F6B7C]">{lesson.missingAssets.length > 0 ? lesson.missingAssets.join(', ') : 'Ready'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ContentSidePanel title="Module readiness" icon={Layers3}>
          {modules.map((module) => (
            <button key={module.id} type="button" onClick={() => onSelect({ type: 'course-module', item: module })} className="w-full rounded-2xl bg-white p-4 text-left">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[#172033]">{module.title}</p>
                  <p className="mt-1 text-sm text-[#5F6B7C]">{getCourseTitle(module.courseId)} · {module.estimatedMinutes} phút</p>
                </div>
                <StatusBadge value={module.status} />
              </div>
            </button>
          ))}
        </ContentSidePanel>
      </div>
    </EntitySection>
  );
}

export function PackagesSection({ items, onSelect, onMockAction }: PackagesSectionProps) {
  const activePackages = items.filter((item) => item.status === 'active');
  const activeSubscribers = items.reduce((sum, item) => sum + item.activeSubscribers, 0);
  const packageRevenue = items.reduce((sum, item) => sum + item.revenueMock, 0);

  return (
    <EntitySection
      title="Quản lý gói học"
      description="Pricing mock, khóa học đi kèm, quota AI và subscriber count cho từng bundle."
      count={items.length}
      aside={
        <ActionRow
          actions={[
            ['Create package', 'Đã mở package composer demo'],
            ['Duplicate', 'Đã duplicate package demo'],
            ['Archive', 'Đã archive package demo'],
          ]}
          onMockAction={onMockAction}
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active packages" value={`${activePackages.length}`} detail="Đang bán trong mock admin" icon={Package} trend="+1" tone="green" />
        <KpiCard label="Subscribers" value={`${activeSubscribers}`} detail="Tổng active subscribers" icon={CheckCircle2} trend="+9%" tone="blue" />
        <KpiCard label="Package revenue" value={formatCurrency(packageRevenue)} detail="Mock revenue theo gói" icon={Sparkles} trend="+14%" tone="orange" />
        <KpiCard label="Avg AI quota" value={`${average(items.map((item) => item.aiMonthlyQuota))}`} detail="Requests / tháng" icon={Bot} trend="+6" tone="purple" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect({ type: 'package', item })} className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 text-left shadow-sm transition hover:border-[#315C73]/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <StatusBadge value={item.status} />
                <h3 className="mt-3 text-lg font-black text-[#172033]">{item.name}</h3>
                <p className="mt-1 text-sm text-[#5F6B7C]">{item.durationDays} ngày · {item.aiMonthlyQuota} AI quota/tháng</p>
              </div>
              <p className="text-right text-lg font-black text-[#172033]">{formatCurrency(item.price)}</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MetricTile label="Subscribers" value={`${item.activeSubscribers}`} />
              <MetricTile label="Revenue" value={formatCurrency(item.revenueMock)} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5F6B7C]">{item.highlight}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.includedCourseIds.map((courseId) => (
                <span key={courseId} className="rounded-full bg-[#F0E8DC] px-3 py-1 text-xs font-black text-[#315C73]">{getCourseTitle(courseId)}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </EntitySection>
  );
}

export function AiPromptsSection({ items, onSelect, onMockAction }: AiPromptsSectionProps) {
  const activePrompts = items.filter((item) => item.status === 'active').length;
  const testingPrompts = items.filter((item) => item.status === 'testing').length;

  return (
    <EntitySection
      title="Quản lý AI prompts"
      description="Prompt library theo purpose, version, provider, guardrails và sample output. Test button chỉ là mock, không gọi provider thật."
      count={items.length}
      aside={
        <ActionRow
          actions={[
            ['Create prompt', 'Đã mở prompt composer demo'],
            ['Test mock', 'Đã chạy test prompt mock'],
            ['Archive', 'Đã archive prompt demo'],
          ]}
          onMockAction={onMockAction}
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active prompts" value={`${activePrompts}`} detail="Đang dùng cho mock flow" icon={Bot} trend="+1" tone="green" />
        <KpiCard label="Testing" value={`${testingPrompts}`} detail="Prompt cần review thêm" icon={Sparkles} trend="+2" tone="blue" />
        <KpiCard label="Providers" value={`${new Set(items.map((item) => item.provider)).size}`} detail="Mock, Gemini, OpenAI..." icon={Archive} trend="+1" tone="purple" />
        <KpiCard label="Guardrails" value={`${items.reduce((sum, item) => sum + item.guardrails.length, 0)}`} detail="Tổng rule đang theo dõi" icon={ShieldAlert} trend="+4" tone="orange" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect({ type: 'ai-prompt', item })} className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 text-left shadow-sm transition hover:border-[#315C73]/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={item.status} />
                  <StatusBadge value={item.provider} />
                  <StatusBadge value={item.purpose} />
                </div>
                <h3 className="mt-3 text-lg font-black text-[#172033]">{item.name}</h3>
                <p className="mt-1 text-sm text-[#5F6B7C]">{item.modelLabel} · {item.version} · {item.owner}</p>
              </div>
              <span className="rounded-full bg-[#F0E8DC] px-3 py-1 text-xs font-black text-[#315C73]">{formatDate(item.updatedAt)}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5F6B7C]">{item.promptBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.guardrails.map((guardrail) => (
                <span key={guardrail} className="rounded-full bg-[#F0E8DC] px-3 py-1 text-xs font-bold text-[#5F6B7C]">{guardrail}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </EntitySection>
  );
}

export function ApiKeysSection({ items, onSelect, onMockAction }: ApiKeysSectionProps) {
  const connectedCount = items.filter((item) => item.status === 'connected').length;
  const attentionCount = items.filter((item) => item.status === 'missing' || item.status === 'expiring').length;

  return (
    <EntitySection
      title="Quản lý API key metadata"
      description="Theo dõi provider, environment, quota và trạng thái key ở dạng masked metadata only. Không lưu secret thật trong frontend."
      count={items.length}
      aside={
        <ActionRow
          actions={[
            ['Add key mock', 'Đã mở form metadata demo only'],
            ['Rotate mock', 'Đã mô phỏng rotate metadata demo only'],
            ['Disable mock', 'Đã mô phỏng disable metadata demo only'],
          ]}
          onMockAction={onMockAction}
        />
      }
    >
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <p className="font-black">Demo metadata only. Real API keys must be stored server-side and never persisted in the browser.</p>
            <p className="mt-2 text-sm leading-6">Màn này chỉ mô phỏng trạng thái, quota và masked key để admin hình dung workflow. Không có input hoặc storage cho raw secret.</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Connected" value={`${connectedCount}`} detail="Provider đang có metadata connected" icon={KeyRound} trend="+1" tone="green" />
        <KpiCard label="Needs attention" value={`${attentionCount}`} detail="Missing hoặc expiring" icon={ShieldAlert} trend="-1" tone="red" />
        <KpiCard label="Quota used" value={`${items.reduce((sum, item) => sum + item.monthlyQuotaUsed, 0)}`} detail="Tổng request mock tháng này" icon={Sparkles} trend="+8%" tone="blue" />
        <KpiCard label="Environments" value={`${new Set(items.map((item) => item.environment)).size}`} detail="Dev, staging, production" icon={Archive} trend="+1" tone="purple" />
      </div>

      <div className="mt-5 hidden overflow-hidden rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F0E8DC] text-xs uppercase tracking-[0.14em] text-[#5F6B7C]">
            <tr>
              <th className="px-4 py-4">Key metadata</th>
              <th className="px-4 py-4">Provider</th>
              <th className="px-4 py-4">Environment</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Quota</th>
              <th className="px-4 py-4">Owner</th>
              <th className="px-4 py-4">Last used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4D8C9]">
            {items.map((item) => {
              const quotaPercent = item.monthlyQuotaLimit > 0 ? Math.round((item.monthlyQuotaUsed / item.monthlyQuotaLimit) * 100) : 0;

              return (
                <tr key={item.id} className="transition hover:bg-[#F8F2EA]">
                  <td className="px-4 py-4">
                    <button type="button" onClick={() => onSelect({ type: 'api-key', item })} className="text-left">
                      <span className="block font-black text-[#172033]">{item.label}</span>
                      <span className="text-xs font-semibold text-[#5F6B7C]">{item.maskedKey}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4"><StatusBadge value={item.provider} /></td>
                  <td className="px-4 py-4"><StatusBadge value={item.environment} /></td>
                  <td className="px-4 py-4"><StatusBadge value={item.status} /></td>
                  <td className="px-4 py-4 min-w-40">
                    <div className="flex items-center gap-3">
                      <ProgressBar value={quotaPercent} tone={getProgressTone(quotaPercent)} />
                      <span className="w-10 text-right font-bold text-[#172033]">{quotaPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#5F6B7C]">{item.owner}</td>
                  <td className="px-4 py-4 text-[#5F6B7C]">{item.lastUsedAt ? formatDate(item.lastUsedAt) : 'Never'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <MobileEntityList
        items={items}
        getKey={(item) => item.id}
        getTitle={(item) => item.label}
        getSubtitle={(item) => `${getStatusLabel(item.provider)} · ${getStatusLabel(item.environment)}`}
        getMeta={(item) => (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={item.status} />
            <span className="rounded-full bg-[#F0E8DC] px-3 py-1 text-xs font-black text-[#315C73]">{item.maskedKey}</span>
          </div>
        )}
        onSelect={(item) => onSelect({ type: 'api-key', item })}
      />
    </EntitySection>
  );
}

function ActionRow({ actions, onMockAction }: { actions: [string, string][]; onMockAction: (message: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(([label, message]) => (
        <button key={label} type="button" onClick={() => onMockAction(message)} className="rounded-full border border-[#E4D8C9] bg-[#FFFCF7] px-3.5 py-2 text-sm font-black text-[#315C73] transition hover:border-[#315C73]/40 hover:bg-white">
          {label}
        </button>
      ))}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F5EFE6] p-3">
      <p className="text-xs font-bold text-[#5F6B7C]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#172033]">{value}</p>
    </div>
  );
}

function ContentSidePanel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-[#F0E8DC] p-3 text-[#315C73]"><Icon className="h-5 w-5" /></span>
        <h3 className="text-xl font-black text-[#172033]">{title}</h3>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </article>
  );
}
