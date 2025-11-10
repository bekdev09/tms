import { useState, useEffect } from "react";

export default function usePersist(): [boolean, (value: boolean) => void] {
  const [persist, setPersist] = useState<boolean>(
    JSON.parse(localStorage.getItem("persist") || "true")
  );

  useEffect(() => {
    localStorage.setItem("persist", JSON.stringify(persist));
  }, [persist]);

  return [persist, setPersist]  as const;
}
