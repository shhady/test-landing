'use client';
import { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Agent2Form from '../components/Agent2Form';
import HomeComponent from '../components/HomeComponent';
import { allowedAgents } from '../config/agents';

export function generateStaticParams() {
  return allowedAgents.map((agent) => ({
    agentName: agent.id,
  }));
}

export default function AgentPage() {
  const [showForm, setShowForm] = useState(false);
  const params = useParams();
  const agentName = params.agentName;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {showForm ? (
        <Agent2Form agentName={agentName} setShowForm={setShowForm} />
      ) : (
        <HomeComponent setShowForm={setShowForm} />
      )}
    </Suspense>
  );
} 