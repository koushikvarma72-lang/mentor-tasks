import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState([]);
  const recognitionRef = useRef(null);

  // Dummy data to "search" on
  const items = [
    "React hooks tutorial.",
    "Node.js backend basics.",
    "Stock market dashboard project.",
    "Movie finder app with trailers.",
    "Voice controlled search using Web Speech API.",
  ];

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Use Chrome/Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang ="en-US";

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript.trim());
    };

    recognition.onend = () => {
      setListening(false);
      if (transcript.trim()) {
        handleSearch(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [transcript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (!listening) {
      setTranscript("");
      setResults([]);
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
    }
  };

  const handleSearch = (query) => {
    const lower = query.toLowerCase();
    const filtered = items.filter((item) =>
      item.toLowerCase().includes(lower)
    );
    setResults(filtered);
  };

  const handleManualSearch = (e) => {
    const value = e.target.value;
    setTranscript(value);
    handleSearch(value);
  };

 return (
  <div className="app-container">
    <div className="app-card">
      <header className="app-header">
        <h1 className="app-title">
          <span className="logo-dot" />
          Voice Search 
        </h1>
        <p className="app-subtitle">
          Speak or type your query and see instant matches.
        </p>
      </header>

      <div className="app-controls">
        <div className="mic-status">
          <span className={`mic-dot ${listening ? "on" : ""}`} />
          <span className="mic-label">Microphone</span>
          <span className={`mic-value ${listening ? "on" : "off"}`}>
            {listening ? "ON" : "OFF"}
          </span>
        </div>

        <button onClick={toggleListening} className="app-button">
          {listening ? "Stop Listening" : "Start Listening"}
        </button>
      </div>

      <div className="app-transcript-block">
        <div className="app-label">Transcript</div>
        <textarea
          className="app-textarea"
          placeholder="Speak or type your query..."
          value={transcript}
          onChange={handleManualSearch}
        />
      </div>

      <section className="results-block">
        <div className="results-header">
          <div className="results-title">Results</div>
          <div className="results-count">
            <strong>{results.length}</strong> match{results.length !== 1 ? "es" : ""}
          </div>
        </div>

        {results.length === 0 ? (
          <p className="empty-state">No results yet. Try speaking “movie” or “dashboard”.</p>
        ) : (
          <ul className="results-list">
            {results.map((item) => (
              <li key={item} className="results-item">
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="app-footer">
        Tip: speak clearly near the mic. Some browsers handle speech better than others[web:41][web:37].
      </div>
    </div>
  </div>
);
}


export default App;
