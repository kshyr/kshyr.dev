"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import NProgress from "nprogress";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/lib/types";

export default function BlogPage({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();

  if (!posts) {
    return null;
  } else {
    NProgress.done();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-4"
    >
      <Table>
        <TableCaption>A list of my blog posts.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="sm:pl-5">Title</TableHead>
            <TableHead className="text-right">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => {
            return (
              <TableRow
                key={post.slug}
                className="cursor-pointer text-[16px]"
                onClick={() => {
                  NProgress.start();
                  NProgress.remove();
                  router.push(`blog/${post.slug}`);
                }}
              >
                <TableCell className="py-5 font-semibold sm:pl-5">
                  {post.title}
                </TableCell>

                <TableCell className="text-right text-[14px]">
                  {post.tags?.join(", ")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}
