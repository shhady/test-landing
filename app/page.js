// import Image from "next/image";
// import Link from "next/link";
'use client'
import Agent2Form from "./components/Agent2Form";
import HomeComponent from "./components/HomeComponent";
import { useState } from "react";
export default function Home() {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
    
    {showForm ? <Agent2Form setShowForm={setShowForm}/> : <HomeComponent setShowForm={setShowForm}/>}
    </>
  );
}
