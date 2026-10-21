import {
  PATH_CLIENT_AI_BRIEF,
  PATH_CLIENT_CONFIRM_PROJECT,
  PATH_CLIENT_POST_PROJECT,
} from '../routes/paths';
import type { ProjectDraftSummary } from '../types/projectDraft';

export function projectDraftHref(draft: ProjectDraftSummary): string {
  const path =
    draft.phase === 'confirm'
      ? PATH_CLIENT_CONFIRM_PROJECT
      : draft.flowType === 'AI'
        ? PATH_CLIENT_AI_BRIEF
        : PATH_CLIENT_POST_PROJECT;
  return `${path}?draftId=${draft.id}`;
}
