import { useCallback, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { tw, wetToast } from 'bsdweb'
import { Label } from './components/ui/shadcn/ui/label'
import { Switch } from './components/ui/shadcn/ui/switch'
import { BrightBaseRealtime, initBrightBase } from 'bsdweb'
import { useAtom } from 'jotai'
import content, { contentStateAtom } from './api/Chrome'

initBrightBase(
  'https://ybpjdhzaqaogrojgsjxh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicGpkaHphcWFvZ3JvamdzanhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYzNzMyOTYsImV4cCI6MjAyMTk0OTI5Nn0.CWTPdwYlV1g6Zif2dKRfVJHK8xwxNhS8gb9Sg3EY4Dg'
)

type VSCodeEvents = {
  test: { message: string }
}
const vscode = new BrightBaseRealtime<VSCodeEvents>('vscode')

export default function App() {
  const [contentState, setContentState] = useAtom(contentStateAtom)

  const onFlipSwitch = useCallback(
    (checked: boolean) => {
      setContentState((prev) => ({ ...prev, switch: checked }))
      content.emit('UPDATE_STATE', { switch: checked })
    },
    [setContentState]
  )

  useEffect(() => content.on('STATE', setContentState), [setContentState])
  useEffect(() => content.emit('GET_STATE', {}), [])

  useEffect(() => vscode.subscribe(), [])
  useEffect(() => vscode.on('test', ({ message }) => wetToast(message, { icon: '🥳' })), [])

  return (
    <div className={tw('max-h-[250px] size-full transition-all duration-500 min-w-[280px]')}>
      <header className="h-12 border-b shadow-sm flex items-center justify-center">
        <div className="px-2 flex items-center justify-between w-full [max-width:1920px]">
          <span className="font-bold text-xl text-primary">VoiceChatAI</span>
          <div className="w-fit flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://github.com/brightsidedeveloper/cmd"
              target="_blank"
              className="size-6 rounded-full overflow-hidden border-border shadow-md"
            >
              <Avatar>
                <AvatarImage src="https://github.com/brightsidedeveloper.png" alt="name" />
                <AvatarFallback>NAME</AvatarFallback>
              </Avatar>
            </a>
          </div>
        </div>
      </header>
      <div className="p-6 w-full flex justify-between items-center gap-4 @container">
        <div className="w-[200px] flex justify-center items-center flex-col gap-3">
          <Label>Switch:</Label>
          <Switch checked={contentState.switch} onCheckedChange={onFlipSwitch} />
        </div>
      </div>
    </div>
  )
}
