import { BrightBaseRealtime, initBrightBase } from 'bsdweb';
import { Hono } from 'hono';

initBrightBase(
	'https://ybpjdhzaqaogrojgsjxh.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicGpkaHphcWFvZ3JvamdzanhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYzNzMyOTYsImV4cCI6MjAyMTk0OTI5Nn0.CWTPdwYlV1g6Zif2dKRfVJHK8xwxNhS8gb9Sg3EY4Dg'
);

const app = new Hono();
const vsChrome = new BrightBaseRealtime<Events>('vscode-chrome');

// Define a route for your custom GPT action
app.post('/snippet', async (c) => {
	const { snippet } = await c.req.json();

	vsChrome.emit('CODE_SNIPPET', { snippet });
	const result = { message: 'This snippet was injected into VSCode: ' + snippet };

	return c.json(result);
});

// Default route
app.all('*', (c) => c.text('Route Not Found', 404));

export default app;

type Events = {
	CODE_SNIPPET: { snippet: string };
};
