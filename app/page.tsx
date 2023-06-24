"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: number;
  parentId?: number;
  author: string;
  content: string;
};

/**
 * Imagine that this is coming from our API
 */
const parentComments: Comment[] = [
  {
    id: 1,
    author: "Tam",
    content: "Hello",
  },
  {
    id: 2,
    author: "Carlos",
    content: "Hi",
  },
];

async function sleepSec(n: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, n * 1000);
  });
}

function ratChewedOnEthernetCable() {
  // 10% chance of an oopsie
  return Math.floor(Math.random() * 10) === 0;
}

async function getChildrenFromBackend(parentId: number): Promise<Comment[]> {
  await sleepSec(1);
  if (ratChewedOnEthernetCable()) {
    throw new Error("failed to fetch");
  }
  const childComments: Record<number, Comment[]> = {
    2: [
      {
        id: 3,
        parentId: 2, // this guy
        author: "Jack",
        content: "Hello",
      },
      {
        id: 5,
        parentId: 2, // this guy
        author: "Other Person",
        content: "how are you, really, though?",
      },
    ],
    1: [
      {
        id: 4,
        parentId: 1,
        author: "Chris",
        content: "Hey there",
      },
    ],
    4: [
      {
        id: 5,
        parentId: 4,
        author: "Tam",
        content: "how are you",
      },
    ],
  };
  return childComments[parentId];
}

function useGetChildren(parentId: number): {
  data: Comment[] | null;
  loading: boolean;
  error: boolean;
} {
  const [data, setData] = useState<Comment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    setLoading(true);
    getChildrenFromBackend(parentId)
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
        setLoading(false);
      });
  }, []);
  return {
    data,
    loading,
    error,
  };
}

function Comment(props: { comment: Comment }) {
  const [showReplies, setShowReplies] = useState(false);
  const { data: children, loading, error } = useGetChildren(props.comment.id);
  const handleToggleShowReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className="m-2 p-2 rounded bg-gray-300">
      <p>{props.comment.author}</p>
      <p>{props.comment.content}</p>
      {loading
        ? "loading..."
        : error
        ? "error occurred"
        : (children?.length || null) && (
            <button
              onClick={handleToggleShowReplies}
              className="p-2 bg-gray-700 text-white rounded"
            >
              {showReplies ? "Hide Replies" : "Show Replies"}
            </button>
          )}
      {showReplies &&
        children &&
        children.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
    </div>
  );
}

function Comments(props: { comments: Comment[] }) {
  const topComments = props.comments.filter((c) => !c.parentId);

  return (
    <div className="flex flex-col max-w-md">
      {topComments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

export default function App() {
  // API fetch happens up here, we don't render <Comments /> until we get the
  // root comments back
  return <Comments comments={parentComments} />;
}
