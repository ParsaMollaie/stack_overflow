import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
    publicRoutes:[
        '/',
        '/all-questions',
        '/api/webhook',
        'question/:id',
        '/tags',
        '/tags/:id',
        '/profile/:id',
        '/community',
        '/jobs',
    ], 
    ignoredRoutes:[
      '/api/webhook', '/api/chatgpt', '/api/askQuestion', '/api/grammarCheck'
    ]
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};