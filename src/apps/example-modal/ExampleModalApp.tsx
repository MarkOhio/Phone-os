import { useState } from "react";
import { useInternalBackHandler } from "../../data/useInternalBackHandler";
import "./ExampleModalApp.css";

/**
 * Example: Modal-based navigation app
 * 
 * This app demonstrates how to use the back-handler system
 * with a modal/dialog stack pattern.
 * 
 * Features:
 * - Base view with action buttons
 * - Modals that stack on top of each other
 * - Back button closes modals before exiting app
 */

interface Modal {
  id: string;
  title: string;
  content: string;
}

export default function ExampleModalApp() {
  const [modalStack, setModalStack] = useState<Modal[]>([]);

  const openModal = (modal: Modal) => {
    setModalStack((prev) => [...prev, modal]);
  };

  const closeModal = () => {
    setModalStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  // Use the generic hook for modal-stack based navigation
  // This tells the back button system: 
  // "I can go back if I have modals open. If not, close the app."
  useInternalBackHandler(modalStack.length > 0, closeModal);

  const currentModal = modalStack[modalStack.length - 1];

  return (
    <div className="example-modal-app">
      {/* Base view */}
      <div className="base-view">
        <h1>Example Modal App</h1>
        <p>
          Open modals to see the back button in action. Each modal stacks on
          top of the previous one.
        </p>

        <button onClick={() => openModal({ id: "1", title: "Settings", content: "Settings content here" })}>
          Open Settings
        </button>
        <button onClick={() => openModal({ id: "2", title: "About", content: "About content here" })}>
          Open About
        </button>
        <button onClick={() => openModal({ id: "3", title: "Help", content: "Help content here" })}>
          Open Help
        </button>

        {modalStack.length > 0 && (
          <div className="modal-indicator">
            {modalStack.length} modal{modalStack.length !== 1 ? "s" : ""} open
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {currentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{currentModal.title}</h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">{currentModal.content}</div>
            <div className="modal-footer">
              <button onClick={closeModal}>Close</button>
              {currentModal.id !== "3" && (
                <button
                  onClick={() =>
                    openModal({
                      id: String(parseInt(currentModal.id) + 1),
                      title: `Nested Modal ${parseInt(currentModal.id) + 1}`,
                      content: `This is a nested modal inside ${currentModal.title}`,
                    })
                  }
                >
                  Open Nested Modal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="help-text">
        💡 Tip: Press the back button (◀) to close modals. When no modals are
        open, back will exit the app.
      </p>
    </div>
  );
}
