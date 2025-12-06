// Type declarations for markdown-it plugins

declare module 'markdown-it-strikethrough-alt' {
  import { PluginSimple } from 'markdown-it';
  const strikethrough: PluginSimple;
  export default strikethrough;
}

declare module 'markdown-it-task-lists' {
  import { PluginWithOptions } from 'markdown-it';

  interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }

  const taskLists: PluginWithOptions<TaskListsOptions>;
  export default taskLists;
}
