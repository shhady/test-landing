'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Agent2Form from '../components/Agent2Form';
import HomeComponent from '../components/HomeComponent';

export default function AgentPage() {
  const [showForm, setShowForm] = useState(false);
  const params = useParams();
  const agentName = params.agentName;

  return (
    <>
      {showForm ? (
        <Agent2Form agentName={agentName} setShowForm={setShowForm} />
      ) : (
        <HomeComponent setShowForm={setShowForm} />
      )}
    </>
  );
} 