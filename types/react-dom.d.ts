// Minimal ambient declaration so `createPortal` from "react-dom" type-checks
// without requiring @types/react-dom (not installed in this workspace).
declare module "react-dom" {
  import * as React from "react";
  export function createPortal(
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: string | null
  ): React.ReactPortal;
}
