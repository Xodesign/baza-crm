import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error("React Error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: "40px", textAlign: "center" }}>
					<h1 style={{ color: "#dc2626", marginBottom: "20px" }}>
						Произошла ошибка
					</h1>
					<pre
						style={{
							textAlign: "left",
							background: "#fee2e2",
							padding: "20px",
							borderRadius: "8px",
							overflow: "auto",
						}}
					>
						{this.state.error?.toString()}
					</pre>
				</div>
			);
		}
		return this.props.children;
	}
}

console.log("App loading...");

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</React.StrictMode>,
);
