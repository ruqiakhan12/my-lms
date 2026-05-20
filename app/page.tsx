"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
};

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from("Courses").select("*");
      if (data) setCourses(data);
    };
    fetchCourses();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <nav className="bg-purple-700 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">LearnHub</h1>
        <div className="flex gap-4">
          <a href="/login" className="bg-white text-purple-700 px-4 py-2 rounded">Login</a>
          <a href="/register" className="bg-yellow-400 text-black px-4 py-2 rounded">Register</a>
        </div>
      </nav>
      <section className="bg-purple-600 text-white text-center py-20 px-4">
        <h2 className="text-5xl font-bold mb-4">Learn Anything, Teach Everything</h2>
        <p className="text-xl mb-8">Buy and sell online courses from expert instructors</p>
        <a href="/courses" className="bg-yellow-400 text-black px-8 py-4 rounded font-bold">Browse Courses</a>
      </section>
      <section className="py-16 px-8">
        <h3 className="text-3xl font-bold text-center mb-10">Featured Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-xl shadow p-6">
              <div className="bg-purple-100 h-40 rounded mb-4"></div>
              <h4 className="text-xl font-bold mb-2">{course.title}</h4>
              <p className="text-gray-500 mb-4">{course.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-purple-700 font-bold text-xl">${course.price}</span>
                <a href="https://learnhub-ruqia.lemonsqueezy.com/checkout/buy/f3f1f99a-6315-4871-9439-61bba69f37be" target="_blank" className="bg-purple-700 text-white px-4 py-2 rounded">Enroll Now</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}