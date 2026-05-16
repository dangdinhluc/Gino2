import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Archive,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Headphones,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  adminActivities,
  adminAiPrompts,
  adminAlerts,
  adminApiKeys,
  adminAssessments,
  adminAudioContent,
  adminCourseLessons,
  adminCourseModules,
  adminCourses,
  adminDocuments,
  adminPackages,
  adminStudents,
  adminVocabulary,
  type AdminAssessment,
  type AdminAudioContent,
  type AdminCourse,
  type AdminEntityType,
  type AdminDocument,
  type AdminStudent,
  type AdminVocabularyItem,
} from '@/src/data/admin';
import { DetailDrawer } from '@/src/features/admin/components/AdminDetailDrawer';
import {
  AdminSidebar,
  AdminTopbar,
  EntitySection,
  FilterBar,
  KpiCard,
  MobileEntityList,
  ProgressBar,
  SectionSwitcher,
  StatusBadge,
} from '@/src/features/admin/components/AdminDashboardPrimitives';
import { AiPromptsSection, ApiKeysSection, CourseContentSection, PackagesSection } from '@/src/features/admin/components/AdminExpansionSections';
import { AdminSupabasePanel } from '@/src/features/admin/components/AdminSupabasePanel';
import {
  average,
  formatCurrency,
  formatDate,
  getCourseTitle,
  getProgressTone,
  sectionFilters,
  useFilteredAdminData,
  type AdminSection,
  type DetailEntity,
  type FilterValue,
} from '@/src/features/admin/lib/adminDashboardModel';

function Overview({ onSelect }: { onSelect: (entity: DetailEntity) => void }) {
  const totalRevenue = adminCourses.reduce((sum, course) => sum + course.revenueMock, 0) + adminPackages.reduce((sum, packageItem) => sum + packageItem.revenueMock, 0);
  const activeStudents = adminStudents.filter((student) => student.riskStatus !== 'paused').length;
  const atRiskStudents = adminStudents.filter((student) => student.riskStatus === 'at-risk').length;
  const pendingAssets = [...adminAssessments, ...adminDocuments, ...adminAudioContent, ...adminCourseLessons].filter(
    (item) => item.status === 'pending-review' || item.status === 'draft',
  ).length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Tổng doanh thu mock"
          value={formatCurrency(totalRevenue)}
          detail={`${adminCourses.length} khóa · ${adminPackages.length} gói`}
          icon={BarChart3}
          trend="+12%"
          tone="orange"
        />
        <KpiCard
          label="Học viên active"
          value={`${activeStudents}`}
          detail={`${atRiskStudents} học viên cần can thiệp`}
          icon={Users}
          trend="+6%"
          tone={atRiskStudents > 0 ? 'red' : 'green'}
        />
        <KpiCard
          label="Completion trung bình"
          value={`${average(adminCourses.map((course) => course.completionRate))}%`}
          detail="Theo tất cả khóa học"
          icon={CheckCircle2}
          trend="+4%"
          tone="green"
        />
        <KpiCard
          label="Content cần review"
          value={`${pendingAssets}`}
          detail="Assessment, docs, audio và lessons"
          icon={Archive}
          trend="-3%"
          tone="purple"
        />
      </div>

      <AdminSupabasePanel />

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#172033]">Operational alerts</h2>
              <p className="mt-1 text-sm text-[#5F6B7C]">Các việc cần xử lý trước để giữ chất lượng học tập.</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-[#C96A1B]" />
          </div>
          <div className="mt-5 grid gap-3">
            {adminAlerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => onSelect(findAlertEntity(alert.relatedEntityType, alert.relatedEntityId))}
                className="rounded-2xl border border-[#E4D8C9] bg-[#F8F2EA] p-4 text-left transition hover:border-[#315C73]/40 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <StatusBadge value={alert.severity} />
                    <h3 className="mt-3 font-black text-[#172033]">{alert.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#5F6B7C]">{alert.description}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#8A95A3]">{formatDate(alert.createdAt)}</span>
                </div>
                <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-[#315C73]">
                  {alert.recommendedAction}
                </p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#E4D8C9] bg-[#172033] p-5 text-white shadow-sm">
          <h2 className="text-xl font-black">Activity feed</h2>
          <p className="mt-1 text-sm text-white/60">Hoạt động gần nhất của admin team.</p>
          <div className="mt-5 space-y-4">
            {adminActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#C96A1B]" />
                <div>
                  <p className="text-sm font-bold">{activity.actorName}</p>
                  <p className="mt-1 text-sm leading-5 text-white/65">
                    {activity.action} · <span className="text-white">{activity.entityTitle}</span>
                  </p>
                  <p className="mt-1 text-xs text-white/45">{formatDate(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {adminCourses.slice(0, 3).map((course) => (
          <button
            key={course.id}
            type="button"
            onClick={() => onSelect({ type: 'course', item: course })}
            className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 text-left shadow-sm transition hover:border-[#315C73]/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <StatusBadge value={course.status} />
                <h3 className="mt-3 font-black text-[#172033]">{course.title}</h3>
              </div>
              <span className="rounded-full bg-[#F0E8DC] px-3 py-1 text-xs font-black text-[#315C73]">{course.level}</span>
            </div>
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-sm font-semibold text-[#5F6B7C]">
                <span>Completion</span>
                <span>{course.completionRate}%</span>
              </div>
              <ProgressBar value={course.completionRate} tone={getProgressTone(course.completionRate)} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5F6B7C]">{course.nextAction}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function findAlertEntity(type: AdminEntityType, id: string): DetailEntity {
  switch (type) {
    case 'course': {
      const course = adminCourses.find((item) => item.id === id);
      return course ? { type: 'course', item: course } : null;
    }
    case 'student': {
      const student = adminStudents.find((item) => item.id === id);
      return student ? { type: 'student', item: student } : null;
    }
    case 'vocabulary': {
      const vocabulary = adminVocabulary.find((item) => item.id === id);
      return vocabulary ? { type: 'vocabulary', item: vocabulary } : null;
    }
    case 'assessment': {
      const assessment = adminAssessments.find((item) => item.id === id);
      return assessment ? { type: 'assessment', item: assessment } : null;
    }
    case 'document': {
      const document = adminDocuments.find((item) => item.id === id);
      return document ? { type: 'document', item: document } : null;
    }
    case 'audio': {
      const audio = adminAudioContent.find((item) => item.id === id);
      return audio ? { type: 'audio', item: audio } : null;
    }
    case 'course-module': {
      const module = adminCourseModules.find((item) => item.id === id);
      return module ? { type: 'course-module', item: module } : null;
    }
    case 'course-lesson': {
      const lesson = adminCourseLessons.find((item) => item.id === id);
      return lesson ? { type: 'course-lesson', item: lesson } : null;
    }
    case 'package': {
      const packageItem = adminPackages.find((item) => item.id === id);
      return packageItem ? { type: 'package', item: packageItem } : null;
    }
    case 'ai-prompt': {
      const prompt = adminAiPrompts.find((item) => item.id === id);
      return prompt ? { type: 'ai-prompt', item: prompt } : null;
    }
    case 'api-key': {
      const apiKey = adminApiKeys.find((item) => item.id === id);
      return apiKey ? { type: 'api-key', item: apiKey } : null;
    }
    default: {
      const exhaustiveType: never = type;
      return exhaustiveType;
    }
  }
}

function CoursesSection({ items, onSelect }: { items: AdminCourse[]; onSelect: (entity: DetailEntity) => void }) {
  return (
    <EntitySection title="Quản lý khóa học" description="Theo dõi trạng thái publish, enrollment, completion, score và action tiếp theo." count={items.length}>
      <MobileEntityList
        items={items}
        getKey={(course) => course.id}
        getTitle={(course) => course.title}
        getSubtitle={(course) => `${course.level} · ${course.lessonCount} lessons · ${course.owner}`}
        getMeta={(course) => (
          <div className="space-y-2">
            <StatusBadge value={course.status} />
            <ProgressBar value={course.completionRate} tone={getProgressTone(course.completionRate)} />
          </div>
        )}
        onSelect={(course) => onSelect({ type: 'course', item: course })}
      />
      <div className="hidden overflow-hidden rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F0E8DC] text-xs uppercase tracking-[0.14em] text-[#5F6B7C]">
            <tr>
              <th className="px-4 py-4">Course</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Students</th>
              <th className="px-4 py-4">Completion</th>
              <th className="px-4 py-4">Avg score</th>
              <th className="px-4 py-4">Revenue</th>
              <th className="px-4 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4D8C9]">
            {items.map((course) => (
              <tr key={course.id} className="transition hover:bg-[#F8F2EA]">
                <td className="px-4 py-4">
                  <button type="button" onClick={() => onSelect({ type: 'course', item: course })} className="text-left">
                    <span className="block font-black text-[#172033]">{course.title}</span>
                    <span className="text-xs font-semibold text-[#5F6B7C]">{course.level} · {course.lessonCount} lessons · {course.owner}</span>
                  </button>
                </td>
                <td className="px-4 py-4"><StatusBadge value={course.status} /></td>
                <td className="px-4 py-4 font-bold text-[#172033]">{course.enrolledCount}</td>
                <td className="px-4 py-4 min-w-40">
                  <div className="flex items-center gap-3">
                    <ProgressBar value={course.completionRate} tone={getProgressTone(course.completionRate)} />
                    <span className="w-10 text-right font-bold text-[#172033]">{course.completionRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 font-bold text-[#172033]">{course.averageScore}%</td>
                <td className="px-4 py-4 font-bold text-[#172033]">{formatCurrency(course.revenueMock)}</td>
                <td className="px-4 py-4 text-sm text-[#5F6B7C]">{course.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EntitySection>
  );
}

function StudentsSection({ items, onSelect }: { items: AdminStudent[]; onSelect: (entity: DetailEntity) => void }) {
  return (
    <EntitySection title="Quản lý học viên" description="Tập trung vào tiến độ, streak, điểm trung bình và học viên cần can thiệp." count={items.length}>
      <MobileEntityList
        items={items}
        getKey={(student) => student.id}
        getTitle={(student) => student.name}
        getSubtitle={(student) => `${student.level} · ${getCourseTitle(student.activeCourseId)}`}
        getMeta={(student) => (
          <div className="space-y-2">
            <StatusBadge value={student.riskStatus} />
            <ProgressBar value={student.progress} tone={getProgressTone(student.progress)} />
          </div>
        )}
        onSelect={(student) => onSelect({ type: 'student', item: student })}
      />
      <div className="hidden overflow-hidden rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F0E8DC] text-xs uppercase tracking-[0.14em] text-[#5F6B7C]">
            <tr>
              <th className="px-4 py-4">Student</th>
              <th className="px-4 py-4">Risk</th>
              <th className="px-4 py-4">Course</th>
              <th className="px-4 py-4">Progress</th>
              <th className="px-4 py-4">Score</th>
              <th className="px-4 py-4">Vocab</th>
              <th className="px-4 py-4">Last active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4D8C9]">
            {items.map((student) => (
              <tr key={student.id} className="transition hover:bg-[#F8F2EA]">
                <td className="px-4 py-4">
                  <button type="button" onClick={() => onSelect({ type: 'student', item: student })} className="text-left">
                    <span className="block font-black text-[#172033]">{student.name}</span>
                    <span className="text-xs font-semibold text-[#5F6B7C]">{student.email}</span>
                  </button>
                </td>
                <td className="px-4 py-4"><StatusBadge value={student.riskStatus} /></td>
                <td className="px-4 py-4 text-[#5F6B7C]">{getCourseTitle(student.activeCourseId)}</td>
                <td className="px-4 py-4 min-w-40">
                  <div className="flex items-center gap-3">
                    <ProgressBar value={student.progress} tone={getProgressTone(student.progress)} />
                    <span className="w-10 text-right font-bold text-[#172033]">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 font-bold text-[#172033]">{student.averageScore}%</td>
                <td className="px-4 py-4 font-bold text-[#172033]">{student.vocabularyKnown}</td>
                <td className="px-4 py-4 text-[#5F6B7C]">{formatDate(student.lastActiveAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EntitySection>
  );
}

function VocabularySection({ items, onSelect }: { items: AdminVocabularyItem[]; onSelect: (entity: DetailEntity) => void }) {
  return (
    <EntitySection title="Quản lý từ vựng" description="Kiểm soát article, audio, ví dụ, error rate và common mistake." count={items.length}>
      <MobileEntityList
        items={items}
        getKey={(item) => item.id}
        getTitle={(item) => `${item.article} ${item.term}`}
        getSubtitle={(item) => `${item.translation} · ${item.topic}`}
        getMeta={(item) => (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={item.reviewStatus} />
            <span className="rounded-full bg-[#F0E8DC] px-3 py-1 text-xs font-black text-[#315C73]">{item.errorRate}% errors</span>
          </div>
        )}
        onSelect={(item) => onSelect({ type: 'vocabulary', item })}
      />
      <div className="hidden overflow-hidden rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F0E8DC] text-xs uppercase tracking-[0.14em] text-[#5F6B7C]">
            <tr>
              <th className="px-4 py-4">Term</th>
              <th className="px-4 py-4">Translation</th>
              <th className="px-4 py-4">Review</th>
              <th className="px-4 py-4">Audio</th>
              <th className="px-4 py-4">Error</th>
              <th className="px-4 py-4">Linked courses</th>
              <th className="px-4 py-4">Common mistake</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4D8C9]">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-[#F8F2EA]">
                <td className="px-4 py-4">
                  <button type="button" onClick={() => onSelect({ type: 'vocabulary', item })} className="text-left">
                    <span className="block font-black text-[#172033]">{item.article} {item.term}</span>
                    <span className="text-xs font-semibold text-[#5F6B7C]">{item.level} · {item.topic}</span>
                  </button>
                </td>
                <td className="px-4 py-4 text-[#5F6B7C]">{item.translation}</td>
                <td className="px-4 py-4"><StatusBadge value={item.reviewStatus} /></td>
                <td className="px-4 py-4 font-bold text-[#172033]">{item.hasAudio ? 'Ready' : 'Missing'}</td>
                <td className="px-4 py-4 font-bold text-[#172033]">{item.errorRate}%</td>
                <td className="px-4 py-4 text-[#5F6B7C]">{item.linkedCourseIds.length}</td>
                <td className="px-4 py-4 text-[#5F6B7C]">{item.commonMistake}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </EntitySection>
  );
}

function AssessmentsSection({ items, onSelect }: { items: AdminAssessment[]; onSelect: (entity: DetailEntity) => void }) {
  return (
    <EntitySection title="Quản lý bài kiểm tra" description="Theo dõi quiz, vocabulary checkpoint, speaking prompt và mock exam." count={items.length}>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((assessment) => (
          <button
            key={assessment.id}
            type="button"
            onClick={() => onSelect({ type: 'assessment', item: assessment })}
            className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 text-left shadow-sm transition hover:border-[#315C73]/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <StatusBadge value={assessment.status} />
                <h3 className="mt-3 text-lg font-black text-[#172033]">{assessment.title}</h3>
                <p className="mt-1 text-sm text-[#5F6B7C]">{getCourseTitle(assessment.courseId)}</p>
              </div>
              <span className="rounded-2xl bg-[#F0E8DC] px-3 py-2 text-xs font-black text-[#315C73]">{assessment.type}</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MetricTile label="Questions" value={`${assessment.questionCount}`} />
              <MetricTile label="Avg score" value={`${assessment.averageScore}%`} />
              <MetricTile label="Completion" value={`${assessment.completionRate}%`} />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#C96A1B]">Weakest: {assessment.weakestSkill}</p>
          </button>
        ))}
      </div>
    </EntitySection>
  );
}

function ContentSection({ documents, audio, onSelect }: { documents: AdminDocument[]; audio: AdminAudioContent[]; onSelect: (entity: DetailEntity) => void }) {
  return (
    <EntitySection
      title="Quản lý tài liệu & audio"
      description="Theo dõi tài liệu học, worksheet, grammar note và audio transcript."
      count={documents.length + audio.length}
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <ContentGroup title="Documents" icon={FileText}>
          {documents.map((document) => (
            <div key={document.id}>
              <ContentButton onClick={() => onSelect({ type: 'document', item: document })}>
                <div>
                  <p className="font-black text-[#172033]">{document.title}</p>
                  <p className="mt-1 text-sm text-[#5F6B7C]">{document.level} · {document.type} · {document.viewCount} views</p>
                </div>
                <StatusBadge value={document.status} />
              </ContentButton>
            </div>
          ))}
        </ContentGroup>
        <ContentGroup title="Audio" icon={Headphones}>
          {audio.map((item) => (
            <div key={item.id}>
              <ContentButton onClick={() => onSelect({ type: 'audio', item })}>
                <div>
                  <p className="font-black text-[#172033]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#5F6B7C]">{item.durationMinutes} min · {item.plays} plays</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge value={item.status} />
                  {item.missingTranscript && <span className="text-xs font-bold text-[#C96A1B]">Missing transcript</span>}
                </div>
              </ContentButton>
            </div>
          ))}
        </ContentGroup>
      </div>
    </EntitySection>
  );
}

function ReportsSection({ onSelect }: { onSelect: (entity: DetailEntity) => void }) {
  const vocabularyIssues = adminVocabulary.filter((item) => !item.hasAudio || !item.example || item.errorRate >= 30);
  const riskyStudents = adminStudents.filter((student) => student.riskStatus === 'at-risk' || student.riskStatus === 'watch');
  const lowCourses = adminCourses.filter((course) => course.completionRate < 70 || course.averageScore < 70);

  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <ReportColumn title="Priority learners" count={riskyStudents.length} icon={Users}>
        {riskyStudents.map((student) => (
          <button key={student.id} type="button" onClick={() => onSelect({ type: 'student', item: student })} className="w-full rounded-2xl bg-white p-4 text-left">
            <StatusBadge value={student.riskStatus} />
            <p className="mt-3 font-black text-[#172033]">{student.name}</p>
            <p className="mt-1 text-sm leading-6 text-[#5F6B7C]">{student.recommendedAction}</p>
          </button>
        ))}
      </ReportColumn>
      <ReportColumn title="Course quality" count={lowCourses.length} icon={GraduationCap}>
        {lowCourses.map((course) => (
          <button key={course.id} type="button" onClick={() => onSelect({ type: 'course', item: course })} className="w-full rounded-2xl bg-white p-4 text-left">
            <StatusBadge value={course.status} />
            <p className="mt-3 font-black text-[#172033]">{course.title}</p>
            <p className="mt-1 text-sm leading-6 text-[#5F6B7C]">Weak area: {course.weakArea}</p>
          </button>
        ))}
      </ReportColumn>
      <ReportColumn title="Vocab quality" count={vocabularyIssues.length} icon={BookOpen}>
        {vocabularyIssues.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect({ type: 'vocabulary', item })} className="w-full rounded-2xl bg-white p-4 text-left">
            <StatusBadge value={item.reviewStatus} />
            <p className="mt-3 font-black text-[#172033]">{item.article} {item.term}</p>
            <p className="mt-1 text-sm leading-6 text-[#5F6B7C]">{item.commonMistake}</p>
          </button>
        ))}
      </ReportColumn>
    </section>
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

function ContentGroup({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
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

function ContentButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-[#E4D8C9] bg-[#F8F2EA] p-4 text-left transition hover:border-[#315C73]/40 hover:bg-white"
    >
      {children}
    </button>
  );
}

function ReportColumn({ title, count, icon: Icon, children }: { title: string; count: number; icon: LucideIcon; children: ReactNode }) {
  return (
    <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C96A1B]">{count} items</p>
          <h2 className="mt-1 text-xl font-black text-[#172033]">{title}</h2>
        </div>
        <Icon className="h-5 w-5 text-[#315C73]" />
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </article>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#D6C7B8] bg-[#FFFCF7] p-10 text-center">
      <Search className="mx-auto h-8 w-8 text-[#8A95A3]" />
      <h3 className="mt-4 text-xl font-black text-[#172033]">Không tìm thấy dữ liệu</h3>
      <p className="mt-2 text-sm text-[#5F6B7C]">Không có bản ghi nào khớp với “{query}”.</p>
    </div>
  );
}

function getActiveSectionResultCount(section: AdminSection, data: ReturnType<typeof useFilteredAdminData>): number {
  if (section === 'courses') {
    return data.courses.length;
  }

  if (section === 'students') {
    return data.students.length;
  }

  if (section === 'vocabulary') {
    return data.vocabulary.length;
  }

  if (section === 'assessments') {
    return data.assessments.length;
  }

  if (section === 'content') {
    return data.documents.length + data.audio.length;
  }

  if (section === 'course-content') {
    return data.courseLessons.length + data.courseModules.length;
  }

  if (section === 'packages') {
    return data.packages.length;
  }

  if (section === 'ai-prompts') {
    return data.aiPrompts.length;
  }

  if (section === 'api-keys') {
    return data.apiKeys.length;
  }

  return 1;
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selectedEntity, setSelectedEntity] = useState<DetailEntity>(null);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef<number | null>(null);
  const data = useFilteredAdminData(activeSection, query, filter);

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    setFilter('all');
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const handleMockAction = (message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 2400);
  };

  const hasEmptyResults = activeSection !== 'overview' && activeSection !== 'reports' && getActiveSectionResultCount(activeSection, data) === 0;

  return (
    <div className="min-h-dvh bg-[#F5EFE6] text-[#172033]">
      <div className="flex min-h-dvh">
        <AdminSidebar activeSection={activeSection} onChange={handleSectionChange} />
        <div className="min-w-0 flex-1">
          <AdminTopbar query={query} onQueryChange={setQuery} />
          <SectionSwitcher activeSection={activeSection} onChange={handleSectionChange} />
          <main className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
            {activeSection !== 'overview' && activeSection !== 'reports' && (
              <FilterBar options={sectionFilters[activeSection]} value={filter} onChange={setFilter} />
            )}

            {hasEmptyResults ? (
              <EmptyState query={query} />
            ) : (
              <>
                {activeSection === 'overview' && <Overview onSelect={setSelectedEntity} />}
                {activeSection === 'courses' && <CoursesSection items={data.courses} onSelect={setSelectedEntity} />}
                {activeSection === 'students' && <StudentsSection items={data.students} onSelect={setSelectedEntity} />}
                {activeSection === 'vocabulary' && <VocabularySection items={data.vocabulary} onSelect={setSelectedEntity} />}
                {activeSection === 'assessments' && <AssessmentsSection items={data.assessments} onSelect={setSelectedEntity} />}
                {activeSection === 'content' && <ContentSection documents={data.documents} audio={data.audio} onSelect={setSelectedEntity} />}
                {activeSection === 'course-content' && (
                  <CourseContentSection
                    modules={data.courseModules}
                    lessons={data.courseLessons}
                    assets={data.lessonAssets}
                    exercises={data.lessonExercises}
                    onSelect={setSelectedEntity}
                    onMockAction={handleMockAction}
                  />
                )}
                {activeSection === 'packages' && <PackagesSection items={data.packages} onSelect={setSelectedEntity} onMockAction={handleMockAction} />}
                {activeSection === 'ai-prompts' && <AiPromptsSection items={data.aiPrompts} onSelect={setSelectedEntity} onMockAction={handleMockAction} />}
                {activeSection === 'api-keys' && <ApiKeysSection items={data.apiKeys} onSelect={setSelectedEntity} onMockAction={handleMockAction} />}
                {activeSection === 'reports' && <ReportsSection onSelect={setSelectedEntity} />}
              </>
            )}
          </main>
        </div>
      </div>

      <DetailDrawer entity={selectedEntity} onClose={() => setSelectedEntity(null)} onMockAction={handleMockAction} />
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#172033] px-5 py-3 text-sm font-bold text-white shadow-xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
