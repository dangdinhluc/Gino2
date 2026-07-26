import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { formatCurrency, formatDate, getCourseTitle, getStatusLabel, type DetailEntity } from '@/src/features/admin/lib/adminDashboardModel';

interface DetailDrawerProps {
  entity: DetailEntity;
  onClose: () => void;
  onMockAction: (label: string) => void;
}

interface DrawerActions {
  secondaryLabel: string;
  secondaryMessage: string;
  primaryLabel: string;
  primaryMessage: string;
}

export function DetailDrawer({ entity, onClose, onMockAction }: DetailDrawerProps) {
  if (!entity) {
    return null;
  }

  const actions = getDrawerActions(entity.type);

  return (
    <div className="fixed inset-0 z-40 bg-[#172033]/30 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng chi tiết" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="absolute bottom-0 left-0 right-0 max-h-[86dvh] overflow-y-auto rounded-t-[2rem] bg-[#FFFCF7] p-5 shadow-2xl md:bottom-auto md:left-auto md:top-4 md:mr-4 md:h-[calc(100dvh-2rem)] md:w-[420px] md:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C96A1B]">{entity.type}</p>
            <h2 className="mt-1 text-2xl font-black text-[#172033]">{getEntityTitle(entity)}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-[#F0E8DC] p-2 text-[#5F6B7C] hover:text-[#172033]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 space-y-4">{renderEntityDetails(entity)}</div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => onMockAction(actions.secondaryMessage)} className="rounded-2xl border border-[#E4D8C9] px-4 py-3 text-sm font-black text-[#315C73]">
            {actions.secondaryLabel}
          </button>
          <button type="button" onClick={() => onMockAction(actions.primaryMessage)} className="rounded-2xl bg-[#C96A1B] px-4 py-3 text-sm font-black text-white">
            {actions.primaryLabel}
          </button>
        </div>
      </aside>
    </div>
  );
}

function getDrawerActions(type: NonNullable<DetailEntity>['type']): DrawerActions {
  if (type === 'api-key') {
    return {
      secondaryLabel: 'Disable mock',
      secondaryMessage: 'Đã mô phỏng đổi trạng thái API key metadata demo only',
      primaryLabel: 'Rotate mock',
      primaryMessage: 'Đã mô phỏng rotate API key metadata demo only',
    };
  }

  if (type === 'package') {
    return {
      secondaryLabel: 'Duplicate',
      secondaryMessage: 'Đã duplicate package demo',
      primaryLabel: 'Mark active',
      primaryMessage: 'Đã set package active demo',
    };
  }

  if (type === 'ai-prompt') {
    return {
      secondaryLabel: 'Test mock',
      secondaryMessage: 'Đã chạy test prompt mock',
      primaryLabel: 'Set active',
      primaryMessage: 'Đã set prompt active demo',
    };
  }

  return {
    secondaryLabel: 'Lưu nháp',
    secondaryMessage: 'Đã lưu nháp thao tác admin',
    primaryLabel: 'Queue review',
    primaryMessage: 'Đã queue review demo',
  };
}

function getEntityTitle(entity: NonNullable<DetailEntity>): string {
  switch (entity.type) {
    case 'course':
    case 'assessment':
    case 'document':
    case 'audio':
    case 'course-module':
    case 'course-lesson':
      return entity.item.title;
    case 'student':
      return entity.item.name;
    case 'vocabulary':
      return entity.item.term;
    case 'package':
    case 'ai-prompt':
      return entity.item.name;
    case 'api-key':
      return entity.item.label;
  }
}

function renderEntityDetails(entity: NonNullable<DetailEntity>): ReactNode {
  switch (entity.type) {
    case 'course':
      return (
        <>
          <DetailRow label="Level" value={entity.item.level} />
          <DetailRow label="Owner" value={entity.item.owner} />
          <DetailRow label="Completion" value={`${entity.item.completionRate}%`} />
          <DetailRow label="Weak area" value={entity.item.weakArea} />
          <DetailNote title="Next action" value={entity.item.nextAction} />
        </>
      );
    case 'student':
      return (
        <>
          <DetailRow label="Email" value={entity.item.email} />
          <DetailRow label="Course" value={getCourseTitle(entity.item.activeCourseId)} />
          <DetailRow label="Progress" value={`${entity.item.progress}%`} />
          <DetailRow label="Average score" value={`${entity.item.averageScore}%`} />
          <DetailNote title="Risk reason" value={entity.item.riskReason} />
          <DetailNote title="Recommended action" value={entity.item.recommendedAction} />
        </>
      );
    case 'vocabulary':
      return (
        <>
          <DetailRow label="Translation" value={entity.item.translation} />
          <DetailRow label="Topic" value={entity.item.topic} />
          <DetailRow label="Audio" value={entity.item.hasAudio ? 'Ready' : 'Missing'} />
          <DetailRow label="Error rate" value={`${entity.item.errorRate}%`} />
          <DetailNote title="Example" value={entity.item.example || 'Chưa có ví dụ'} />
          <DetailNote title="Common mistake" value={entity.item.commonMistake} />
        </>
      );
    case 'assessment':
      return (
        <>
          <DetailRow label="Course" value={getCourseTitle(entity.item.courseId)} />
          <DetailRow label="Type" value={entity.item.type} />
          <DetailRow label="Average score" value={`${entity.item.averageScore}%`} />
          <DetailRow label="Completion" value={`${entity.item.completionRate}%`} />
          <DetailNote title="Weakest skill" value={entity.item.weakestSkill} />
        </>
      );
    case 'document':
      return (
        <>
          <DetailRow label="Course" value={getCourseTitle(entity.item.courseId)} />
          <DetailRow label="Type" value={entity.item.type} />
          <DetailRow label="Views" value={`${entity.item.viewCount}`} />
          <DetailRow label="Downloads" value={`${entity.item.downloadCount}`} />
          <DetailRow label="Updated" value={formatDate(entity.item.updatedAt)} />
        </>
      );
    case 'audio':
      return (
        <>
          <DetailRow label="Course" value={getCourseTitle(entity.item.courseId)} />
          <DetailRow label="Duration" value={`${entity.item.durationMinutes} phút`} />
          <DetailRow label="Plays" value={`${entity.item.plays}`} />
          <DetailRow label="Transcript" value={entity.item.missingTranscript ? 'Missing' : 'Ready'} />
        </>
      );
    case 'course-module':
      return (
        <>
          <DetailRow label="Course" value={getCourseTitle(entity.item.courseId)} />
          <DetailRow label="Status" value={getStatusLabel(entity.item.status)} />
          <DetailRow label="Lessons" value={`${entity.item.lessonCount}`} />
          <DetailRow label="Estimate" value={`${entity.item.estimatedMinutes} phút`} />
          <DetailRow label="Owner" value={entity.item.owner} />
          <DetailRow label="Updated" value={formatDate(entity.item.updatedAt)} />
        </>
      );
    case 'course-lesson':
      return (
        <>
          <DetailRow label="Course" value={getCourseTitle(entity.item.courseId)} />
          <DetailRow label="Type" value={getStatusLabel(entity.item.type)} />
          <DetailRow label="Status" value={getStatusLabel(entity.item.status)} />
          <DetailRow label="Assets" value={`${entity.item.assetCount}`} />
          <DetailRow label="Exercises" value={`${entity.item.exerciseCount}`} />
          <DetailRow label="Quality" value={`${entity.item.qualityScore}%`} />
          <DetailNote title="Missing assets" value={entity.item.missingAssets.length > 0 ? entity.item.missingAssets.join(', ') : 'Ready'} />
        </>
      );
    case 'package':
      return (
        <>
          <DetailRow label="Status" value={getStatusLabel(entity.item.status)} />
          <DetailRow label="Price" value={formatCurrency(entity.item.price)} />
          <DetailRow label="Duration" value={`${entity.item.durationDays} ngày`} />
          <DetailRow label="AI quota" value={`${entity.item.aiMonthlyQuota}/tháng`} />
          <DetailRow label="Subscribers" value={`${entity.item.activeSubscribers}`} />
          <DetailRow label="Revenue mock" value={formatCurrency(entity.item.revenueMock)} />
          <DetailNote title="Included courses" value={entity.item.includedCourseIds.map(getCourseTitle).join(', ')} />
          <DetailNote title="Target audience" value={entity.item.targetAudience} />
          <DetailNote title="Highlight" value={entity.item.highlight} />
        </>
      );
    case 'ai-prompt':
      return (
        <>
          <DetailRow label="Purpose" value={getStatusLabel(entity.item.purpose)} />
          <DetailRow label="Provider" value={getStatusLabel(entity.item.provider)} />
          <DetailRow label="Model" value={entity.item.modelLabel} />
          <DetailRow label="Status" value={getStatusLabel(entity.item.status)} />
          <DetailRow label="Version" value={entity.item.version} />
          <DetailRow label="Owner" value={entity.item.owner} />
          <DetailNote title="Prompt body" value={entity.item.promptBody} />
          <DetailNote title="Guardrails" value={entity.item.guardrails.join(' · ')} />
          <DetailNote title="Sample input" value={entity.item.sampleInput} />
          <DetailNote title="Sample output" value={entity.item.sampleOutput} />
        </>
      );
    case 'api-key':
      return (
        <>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
            Demo metadata only. Real API keys must be stored server-side and never persisted in the browser.
          </div>
          <DetailRow label="Provider" value={getStatusLabel(entity.item.provider)} />
          <DetailRow label="Environment" value={getStatusLabel(entity.item.environment)} />
          <DetailRow label="Status" value={getStatusLabel(entity.item.status)} />
          <DetailRow label="Masked key" value={entity.item.maskedKey} />
          <DetailRow label="Quota" value={`${entity.item.monthlyQuotaUsed}/${entity.item.monthlyQuotaLimit}`} />
          <DetailRow label="Owner" value={entity.item.owner} />
          <DetailRow label="Created" value={formatDate(entity.item.createdAt)} />
          <DetailRow label="Last used" value={entity.item.lastUsedAt ? formatDate(entity.item.lastUsedAt) : 'Never'} />
        </>
      );
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F5EFE6] px-4 py-3">
      <span className="text-sm font-semibold text-[#5F6B7C]">{label}</span>
      <span className="text-right text-sm font-black text-[#172033]">{value}</span>
    </div>
  );
}

function DetailNote({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F5EFE6] p-4">
      <p className="text-sm font-black text-[#172033]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#5F6B7C]">{value}</p>
    </div>
  );
}
