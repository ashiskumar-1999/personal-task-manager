import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, LogOut, User } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { firebaseConfig } from "@/config/firebase";

export type TaskProps = {
  id: string;
  title: string;
  description?: string;
  category: string;
  dueDate: string;
  status: string;
};

const DashBoard = () => {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const navigate = useNavigate();
  const db = getFirestore(firebaseConfig);
  const auth = getAuth(firebaseConfig);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...tasks];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      result = result.filter((task) => task.category === filterCategory);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((task) => task.status === filterStatus);
    }

    setFilteredTasks(result);
  }, [tasks, searchQuery, filterCategory, filterStatus]);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const taskRef = doc(db, "users", user.uid, "tasks", taskId);
      await updateDoc(taskRef, {
        status: newStatus,
      });

      // Update local state
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
              }
            : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Failed to update task status. Please try again.");
    }
  };

  useEffect(() => {
    const fetchTasks = async (userId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const queryTasks = collection(db, "users", userId, "tasks");
        const taskDocs = await getDocs(queryTasks);

        const tasksData = taskDocs.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            category: data.category || "",
            status: data.status || (data.completed ? "completed" : "todo"),
            dueDate: data.dueDate?.toDate().toLocaleDateString() || "",
          };
        });

        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchTasks(user.uid);
      } else {
        setTasks([]);
        setIsLoading(false);
        navigate("/login");
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [auth, db, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("ProfileName");
      localStorage.removeItem("Photo");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  const userName =
    localStorage.getItem("ProfileName") ||
    auth.currentUser?.email?.split("@")[0] ||
    "User";

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "work":
        return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800";
      case "personal":
        return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800";
      default:
        return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50 min-h-screen w-screen">
      {/* Profile Section */}
      <div className="flex flex-col items-start gap-3 bg-white p-4 rounded-lg w-[250px] border-l-4 border-indigo-600 shadow-sm">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-slate-700" />
          <span className="font-medium text-slate-700">
            Welcome, {userName}
          </span>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="hover:text-red-600 gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => navigate("/add-task")}
            className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-800"
          >
            Add Task
          </Button>
          {isLoading && <span className="text-gray-600">Loading tasks...</span>}
        </div>
      </div>

      <Table className="w-full border rounded-lg bg-white shadow overflow-hidden">
        {!isLoading && filteredTasks.length === 0 && (
          <TableCaption>
            {searchQuery || filterCategory !== "all" || filterStatus !== "all"
              ? "No tasks match your filters"
              : "No tasks available"}
          </TableCaption>
        )}

        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4 text-left bg-indigo-600 text-white uppercase text-sm py-3">
              Title
            </TableHead>
            <TableHead className="w-1/4 text-left bg-indigo-600 text-white uppercase text-sm py-3">
              Category
            </TableHead>
            <TableHead className="w-1/4 text-left bg-indigo-600 text-white uppercase text-sm py-3">
              Due Date
            </TableHead>
            <TableHead className="w-1/4 text-left bg-indigo-600 text-white uppercase text-sm py-3">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading &&
            filteredTasks.map((task: TaskProps) => (
              <TableRow
                key={task.id}
                className="border-b border-gray-200 hover:bg-slate-50 transition-colors odd:bg-white even:bg-slate-50"
              >
                <TableCell className="w-1/4 text-left font-medium px-4 py-3">
                  {task.title}
                </TableCell>
                <TableCell className="w-1/4 text-left px-4 py-3">
                  <span className={getCategoryBadge(task.category)}>
                    {task.category}
                  </span>
                </TableCell>
                <TableCell className="w-1/4 text-left px-4 py-3">
                  {task.dueDate}
                </TableCell>
                <TableCell className="w-1/4 text-left px-4 py-3 flex items-center gap-3">
                  <Select
                    defaultValue={task.status}
                    onValueChange={(value) => updateTaskStatus(task.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo" className="cursor-pointer">
                        To Do
                      </SelectItem>
                      <SelectItem
                        value="in-progress"
                        className="cursor-pointer"
                      >
                        In Progress
                      </SelectItem>
                      <SelectItem value="completed" className="cursor-pointer">
                        Completed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DashBoard;
