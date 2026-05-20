"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
};

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from("Courses").select("*");
      if (data) setCourses(data);
    };
    fetchCourses();
  }, []);

  return (
    <main className="max-w-4xl mx-auto mt-20 px-4">
      <h1 className="text-3xl font-bold mb-8">All Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="border rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <p className="text-purple-700 font-bold">${course.price}</p>
            <a href="https://learnhub-ruqia.lemonsqueezy.com/checkout/buy/f3f1f99a-6315-4871-9439-61bba69f37be" target="_blank" className="mt-4 bg-purple-700 text-white px-4 py-2 rounded w-full block text-center">Enroll Now</a>
          </div>
        ))}
      </div>
    </main>
  );
}