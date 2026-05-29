import "./styles/PasswordDialog.css"
import { useEffect, useState } from "react"

export default function PasswordDialog({ open, ssid, error, onCancel, onSubmit, submitting = false }) {
    const [password, setPassword] = useState("")

    useEffect(() => {
        if (open) {
            setPassword("")
        }
    }, [open, ssid])

    if (!open) {
        return null
    }

    return (
        <div className="password-dialog-backdrop" role="presentation" onClick={onCancel}>
            <div className="password-dialog" role="dialog" aria-modal="true" aria-labelledby="password-dialog-title" onClick={(event) => event.stopPropagation()}>
                <div className="password-dialog-title" id="password-dialog-title">Enter WiFi password</div>
                <div className="password-dialog-ssid">{ssid}</div>
                {error && <div className="password-dialog-error">Incorrect Password</div>}

                <form
                    className="password-dialog-form"
                    onSubmit={(event) => {
                        event.preventDefault()
                        onSubmit(password)
                    }}
                >
                    <input
                        className="password-dialog-input"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Password"
                        autoFocus
                    />

                    <div className="password-dialog-actions">
                        <button type="button" className="password-dialog-button secondary" onClick={onCancel} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="password-dialog-button primary" disabled={submitting || !password.trim()}>
                            {submitting ? "Connecting..." : "Connect"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}