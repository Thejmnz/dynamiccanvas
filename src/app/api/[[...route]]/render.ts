import { Hono } from 'hono';

const app = new Hono();

// GET endpoint for documentation
app.get('/', (c) => {
    return c.json({
        endpoint: "/api/render",
        method: "POST",
        description: "Generate images from templates with dynamic data",
        authentication: "Bearer token in Authorization header",
        note: "Use POST method to render templates. This endpoint uses the optimized cache system."
    });
});

// POST endpoint - delegate to the actual implementation
app.post('/', async (c) => {
    try {
        // Import and use the actual render handler
        const { POST: renderHandler } = await import('../render/route');

        // Pass the request to the actual handler
        const response = await renderHandler(c.req.raw as any);

        return response;
    } catch (error: any) {
        console.error('[Render Hono Wrapper Error]:', error);
        return c.json({
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, 500);
    }
});

export default app;
