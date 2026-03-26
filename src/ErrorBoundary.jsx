import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.error) {
      const msg =
        this.state.error?.message || String(this.state.error || "未知错误");
      return (
        <div
          style={{
            padding: 20,
            fontFamily: "system-ui, sans-serif",
            color: "#b91c1c",
            background: "#fff1f2",
            minHeight: "100vh",
            boxSizing: "border-box",
          }}
        >
          <p style={{ fontWeight: 800, marginBottom: 8 }}>页面运行时出错</p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 13,
              margin: 0,
            }}
          >
            {msg}
          </pre>
          <p style={{ marginTop: 16, color: "#64748b", fontSize: 13 }}>
            请打开浏览器开发者工具（F12）→ Console 查看完整堆栈；或把截图发给开发者。
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
