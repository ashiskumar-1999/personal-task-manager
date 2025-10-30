import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "@/config/firebase";
import { useNavigate } from "react-router";

export type FormProps = {
  title: string;
  description?: string;
  category: string;
  dueDate: Date | undefined;
  status: string;
};

type FormErrors = {
  [K in keyof FormProps]?: string;
};

const AddTask = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormProps>({
    title: "",
    description: "",
    category: "",
    dueDate: undefined,
    status: "",
  });

  const db = getFirestore(firebaseConfig);
  const auth = getAuth(firebaseConfig);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  console.log("Form Data:", formData);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.title) {
      newErrors.title = "Title is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Select a due date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user || !validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const taskId = crypto.randomUUID();
      const taskRef = doc(db, "users", user.uid, "tasks", taskId);

      await setDoc(taskRef, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        dueDate: formData.dueDate,
        completed: formData.status === "completed",
        createdAt: new Date(),
      });

      setFormData({
        title: "",
        description: "",
        category: "",
        dueDate: undefined,
        status: "",
      });

      alert("✅ Task saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error writing document: ", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-4 gap-4 border rounded-lg max-w-2xl mx-auto">
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="space-y-3">
          {/* Task Title Input */}
          <div className="text-left">
            <Label
              htmlFor="task-title"
              className="block text-sm font-medium text-gray-700"
            >
              Task Title*
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              className={`mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${
                errors.title ? "border-red-500" : ""
              }`}
              value={formData.title}
              onChange={handleChange}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div className="text-left">
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="text-left">
            <Label className="block text-sm font-medium text-gray-700">
              Task Category*
            </Label>
            <div className="flex items-center space-x-4 mt-1">
              <Button
                type="button"
                id="category"
                value="work"
                variant="outline"
                className={`px-4 py-2 rounded-md border-0 transition-colors ${
                  formData.category === "work"
                    ? "bg-indigo-600 text-white hover:bg-indigo-800 hover:text-white ring-2 ring-indigo-300"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, category: "work" }))
                }
              >
                Work
              </Button>
              <Button
                type="button"
                id="category"
                value="personal"
                variant="outline"
                className={`px-4 py-2 rounded-md border-0 transition-colors ${
                  formData.category === "personal"
                    ? "bg-indigo-600 text-white hover:text-white hover:bg-indigo-800 ring-2 ring-indigo-300"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, category: "personal" }))
                }
              >
                Personal
              </Button>
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Due Date and Status */}
          <div className="flex flex-row gap-6 mt-4">
            <div className="text-left">
              <Label
                htmlFor="due-date"
                className="block text-sm font-medium text-gray-700"
              >
                Due on*
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    className="w-48 justify-between font-normal !bg-slate-200 text-black focus:ring-none"
                  >
                    {formData.dueDate
                      ? new Date(formData.dueDate).toLocaleDateString()
                      : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={
                      formData.dueDate ? new Date(formData.dueDate) : undefined
                    }
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setFormData((prev) => ({ ...prev, dueDate: date }));
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="text-left">
              <Label
                htmlFor="task-status"
                className="block text-sm font-medium"
              >
                Task Status*
              </Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                required
              >
                <SelectTrigger className="w-[180px] !bg-slate-200 text-black border-0">
                  <SelectValue placeholder="Add Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="todo">To-Do</SelectItem>
                    <SelectItem value="in-progress">In-Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 mt-6 rounded-lg bg-indigo-600 hover:bg-indigo-800 text-white font-15 font-bold disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Task...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;
