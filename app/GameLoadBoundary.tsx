"use client";

import { Component, type ReactNode } from "react";

// A failed optional chunk must not replace the entire home/practice screen.
// The caller keys this boundary by activity so other games remain usable.
export class GameLoadBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
