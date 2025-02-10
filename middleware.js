import { NextResponse } from 'next/server';
import { allowedAgents } from './app/config/agents';

export function middleware(request) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // If it's not an agent route, continue
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Check if it's an agent route
  const agentName = pathname.split('/')[1];
  if (!agentName) return NextResponse.next();

  // If it's a form route for an agent, check the agent name from the parent path
  if (pathname.includes('/form')) {
    const agentName = pathname.split('/')[1];
    const isAllowedAgent = allowedAgents.some(agent => agent.id === agentName);
    if (!isAllowedAgent) {
      // Redirect to home page with error
      return NextResponse.redirect(new URL('/?error=invalid-agent', request.url));
    }
    return NextResponse.next();
  }

  // Check if the agent is allowed
  const isAllowedAgent = allowedAgents.some(agent => agent.id === agentName);
  if (!isAllowedAgent) {
    // Redirect to home page with error
    return NextResponse.redirect(new URL('/?error=invalid-agent', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 