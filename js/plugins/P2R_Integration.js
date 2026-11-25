/*:
 * @target MZ
 * @plugindesc P2R login, wallet, sessions, rhythm scoring, leaderboard, and Extra Life.
 * @author Lumina Adventure
 *
 * @param ProxyBaseUrl
 * @text URL server proxy
 * @type string
 * @default http://localhost:3000
 * @desc URL server proxy P2R, without a trailing slash.
 *
 * @param GameSlug
 * @text Slug game
 * @type string
 * @default lumina-adventure
 *
 * @param RequestTimeoutMs
 * @text Batas waktu permintaan (ms)
 * @type number
 * @min 1000
 * @default 20000
 *
 * @param ScoreVariableId
 * @text ID variabel skor run
 * @type variable
 * @default 4
 *
 * @param RoundsPerRun
 * @text Jumlah ronde rhythm per run
 * @type number
 * @min 1
 * @default 10
 * @desc Lumina Adventure saat ini memiliki 10 battle rhythm.
 *
 * @param EventId
 * @text ID event P2R
 * @type string
 * @default
 * @desc Boleh kosong sampai panitia memberikan event_id.
 *
 * @param Platform
 * @text Platform
 * @type string
 * @default web
 *
 * @param GameVersion
 * @text Versi game
 * @type string
 * @default 1.0.0
 *
 * @param ContractVersion
 * @text Versi kontrak skor
 * @type string
 * @default 1.0
 *
 * @command Login
 * @text Login pemain
 * @desc Login dengan email dan kata sandi, lalu tampilkan email dan saldo koin.
 *
 * @command ShowProfile
 * @text Tampilkan profil dan saldo
 * @desc Ambil saldo terbaru dan tampilkan profil pemain.
 *
 * @command RefreshWallet
 * @text Muat ulang saldo
 * @desc Ambil saldo terbaru dan tampilkan profil pemain.
 *
 * @command Logout
 * @text Logout pemain
 * @desc Kirim logout ke P2R dan hapus token dari memori game.
 *
 * @command CheckIntegrationStatus
 * @text Cek koneksi P2R
 * @desc Periksa koneksi proxy dan status integrasi P2R.
 *
 * @command StartRun
 * @text Mulai run P2R
 * @desc Cek saldo dan mulai sesi berbayar. Biaya dibaca dari konfigurasi game P2R.
 *
 * @command CompleteRun
 * @text Selesaikan run P2R
 * @desc Hitung skor maksimal 600 dan kirim hasil run ke P2R.
 *
 * @command RetryComplete
 * @text Coba kirim skor lagi
 * @desc Kirim ulang payload skor yang sama selama sesi P2R belum kedaluwarsa.
 *
 * @command ShowLeaderboard
 * @text Tampilkan leaderboard P2R
 * @desc Ambil leaderboard saat diminta, tanpa polling otomatis.
 *
 * @arg limit
 * @text Jumlah baris
 * @type number
 * @min 1
 * @max 100
 * @default 10
 *
 * @arg offset
 * @text Mulai dari baris
 * @type number
 * @min 0
 * @default 0
 */

(function() {
    "use strict";

    const pluginName = "P2R_Integration";
    const parameters = PluginManager.parameters(pluginName);
    const proxyBaseUrl = String(parameters.ProxyBaseUrl || "http://localhost:3000")
        .trim()
        .replace(/\/+$/, "");
    const gameSlug = String(parameters.GameSlug || "lumina-adventure").trim();
    const configuredTimeoutMs = Number(parameters.RequestTimeoutMs || 20000);
    const requestTimeoutMs = Number.isFinite(configuredTimeoutMs)
        ? Math.max(1000, configuredTimeoutMs)
        : 20000;
    const scoreVariableId = Math.max(1, Number(parameters.ScoreVariableId || 4));
    const configuredRoundCount = Number(parameters.RoundsPerRun || 10);
    const roundsPerRun = Number.isInteger(configuredRoundCount) && configuredRoundCount > 0
        ? configuredRoundCount
        : 10;
    const eventId = String(parameters.EventId || "").trim();
    const platform = String(parameters.Platform || "web").trim();
    const gameVersion = String(parameters.GameVersion || "1.0.0").trim();
    const contractVersion = String(parameters.ContractVersion || "1.0").trim();
    const maximumRunScore = 600;

    const messages = {
        INVALID_CREDENTIALS: "Email atau kata sandi salah. Periksa kembali lalu coba lagi.",
        UNAUTHENTICATED: "Sesi login berakhir. Silakan login kembali.",
        INSUFFICIENT_COIN: "Koin tidak cukup. Silakan top up terlebih dahulu.",
        SESSION_NOT_ACTIVE: "Sesi permainan tidak aktif. Mulai permainan lagi.",
        SESSION_EXPIRED: "Sesi permainan sudah kedaluwarsa. Mulai permainan lagi.",
        INVALID_SCORE: "Skor tidak sesuai aturan. Periksa data skor permainan.",
        INVALID_METADATA: "Data tambahan permainan tidak sesuai aturan.",
        ECONOMY_ACTION_NOT_CONFIGURED: "Aksi koin ini belum diaktifkan oleh admin P2R.",
        RATE_LIMIT_EXCEEDED: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",
        NETWORK_UNAVAILABLE: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        UPSTREAM_UNAVAILABLE: "Server P2R sedang tidak dapat dijangkau. Coba lagi nanti.",
        UPSTREAM_TIMEOUT: "Server P2R terlalu lama merespons. Coba lagi sebentar.",
        PROXY_NOT_CONFIGURED: "Server proxy belum dikonfigurasi oleh admin.",
        PROXY_CONFIGURATION_ERROR: "Proxy belum siap. Periksa konfigurasi server.",
        PROXY_INTERNAL_ERROR: "Server proxy mengalami gangguan.",
        PROXY_ROUTE_NOT_FOUND: "Rute API tidak tersedia di proxy. Restart atau perbarui server proxy.",
        INVALID_AUTHORIZATION_HEADER: "Format login tidak valid. Silakan login kembali.",
        ORIGIN_NOT_ALLOWED: "Alamat game belum diizinkan di pengaturan server proxy.",
        INVALID_UPSTREAM_RESPONSE: "Server P2R mengirim jawaban yang tidak dapat dibaca.",
        INVALID_RESPONSE: "Server mengirim jawaban yang tidak dapat dibaca.",
        INTEGRATION_UNAVAILABLE: "Status integrasi belum tersedia. Periksa konfigurasi P2R.",
        UUID_UNAVAILABLE: "Browser game tidak mendukung pembuatan ID percobaan yang aman.",
        UNKNOWN: "Permintaan belum berhasil. Coba lagi atau hubungi admin."
    };

    let playerToken = null;
    let playerEmail = "";
    let walletBalance = null;
    let overlay = null;
    let overlayBgm = null;
    let overlayBlocksInterpreter = false;
    let pendingCommands = 0;
    let previousWaitMode = null;
    let loginContinueAction = null;
    let activeRun = null;
    let pendingStartRequest = null;
    let pendingCompletion = null;
    let startTransferPending = false;
    let gameEconomyActions = [];
    let pendingRevive = null;

    function friendlyError(code) {
        return messages[code] || messages.UNKNOWN;
    }

    function makeApiError(code, status, diagnostic) {
        const error = new Error(friendlyError(code));
        error.code = code;
        error.status = status || 0;
        error.diagnostic = diagnostic || null;
        return error;
    }

    function requestDiagnostic(method, path, status, code, body) {
        const response = {};
        ["success", "message", "error_code", "errors"].forEach(function(key) {
            if (body && Object.prototype.hasOwnProperty.call(body, key)) {
                response[key] = body[key];
            }
        });
        return {
            timestamp: new Date().toISOString(),
            method: method,
            path: "/api/v1" + path,
            http_status: status || 0,
            error_code: code || null,
            server_message: body && typeof body.message === "string"
                ? body.message
                : null,
            response: Object.keys(response).length > 0 ? response : null
        };
    }

    function diagnosticReport(context) {
        return JSON.stringify(context, null, 2);
    }

    function errorDiagnosticReport(error, operation, details) {
        const report = Object.assign({}, error && error.diagnostic || {});
        report.operation = operation;
        if (!report.timestamp) {
            report.timestamp = new Date().toISOString();
        }
        if (error) {
            report.error_code = error.code || report.error_code || null;
            report.http_status = error.status || report.http_status || 0;
            if (error.message && !report.server_message) {
                report.client_message = error.message;
            }
        }
        if (details) {
            report.details = details;
        }
        return diagnosticReport(report);
    }

    function parseRetryDelay(headerValue) {
        if (!headerValue) {
            return 5000;
        }
        const seconds = Number(headerValue);
        if (Number.isFinite(seconds)) {
            return Math.max(0, seconds * 1000);
        }
        const date = Date.parse(headerValue);
        return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 5000;
    }

    function delay(milliseconds) {
        return new Promise(function(resolve) {
            setTimeout(resolve, milliseconds);
        });
    }

    function readResponseBody(response) {
        return response.text().then(function(text) {
            if (!text) {
                return null;
            }
            try {
                return JSON.parse(text);
            } catch (_error) {
                throw makeApiError("INVALID_RESPONSE", response.status);
            }
        });
    }

    async function requestApi(path, options) {
        const requestOptions = options || {};
        const method = requestOptions.method || "GET";
        const authenticated = Boolean(requestOptions.authenticated);
        const optionalPlayerAuth = Boolean(requestOptions.optionalPlayerAuth);
        const loginRequest = Boolean(requestOptions.loginRequest);
        const triggerLoginOnUnauthorized = requestOptions.triggerLoginOnUnauthorized !== false;
        const retryNotice = requestOptions.onRetryNotice;
        const onResponse = requestOptions.onResponse;
        const headers = { Accept: "application/json" };

        if (requestOptions.body !== undefined) {
            headers["Content-Type"] = "application/json";
        }
        if (authenticated) {
            if (!playerToken) {
                throw makeApiError("UNAUTHENTICATED", 401);
            }
            headers.Authorization = "Bearer " + playerToken;
        } else if (optionalPlayerAuth && playerToken) {
            headers.Authorization = "Bearer " + playerToken;
        }

        const url = proxyBaseUrl + "/api/v1" + path;
        let retryCount = 0;
        let retriedWithoutPlayerToken = false;

        while (true) {
            const controller = new AbortController();
            const timeoutId = setTimeout(function() {
                controller.abort();
            }, requestTimeoutMs);

            let response;
            try {
                response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: requestOptions.body === undefined
                        ? undefined
                        : JSON.stringify(requestOptions.body),
                    cache: "no-store",
                    credentials: "omit",
                    signal: controller.signal
                });
            } catch (_error) {
                clearTimeout(timeoutId);
                throw makeApiError(
                    "NETWORK_UNAVAILABLE",
                    0,
                    requestDiagnostic(method, path, 0, "NETWORK_UNAVAILABLE", null)
                );
            }
            clearTimeout(timeoutId);

            if (
                response.status === 401 &&
                optionalPlayerAuth &&
                headers.Authorization &&
                !retriedWithoutPlayerToken
            ) {
                delete headers.Authorization;
                retriedWithoutPlayerToken = true;
                continue;
            }

            if (response.status === 429 && retryCount === 0) {
                const waitMs = parseRetryDelay(response.headers.get("Retry-After"));
                if (waitMs > 60000) {
                    throw makeApiError("RATE_LIMIT_EXCEEDED", 429);
                }
                if (typeof retryNotice === "function") {
                    retryNotice(Math.ceil(waitMs / 1000));
                }
                await delay(waitMs);
                retryCount += 1;
                continue;
            }

            let body;
            try {
                body = await readResponseBody(response);
            } catch (error) {
                error.diagnostic = requestDiagnostic(
                    method,
                    path,
                    response.status,
                    error.code || "INVALID_RESPONSE",
                    null
                );
                throw error;
            }
            if (!response.ok || (body && body.success === false)) {
                let errorCode = body && body.error_code;
                if (loginRequest && response.status === 401) {
                    errorCode = "INVALID_CREDENTIALS";
                } else if (response.status === 401 && authenticated) {
                    errorCode = "UNAUTHENTICATED";
                    if (triggerLoginOnUnauthorized) {
                        clearPlayerSession();
                        openLoginDialog(friendlyError(errorCode), false);
                    }
                } else if (response.status === 429) {
                    errorCode = "RATE_LIMIT_EXCEEDED";
                } else if (!errorCode) {
                    errorCode = "UNKNOWN";
                }
                const apiError = makeApiError(
                    errorCode,
                    response.status,
                    requestDiagnostic(method, path, response.status, errorCode, body)
                );
                if (!messages[errorCode] && body && typeof body.message === "string") {
                    apiError.message = body.message +
                        " (kode " + errorCode + ", HTTP " + response.status + ").";
                }
                throw apiError;
            }
            if (typeof onResponse === "function") {
                onResponse(response.status, body);
            }
            return body;
        }
    }

    function clearPlayerSession() {
        playerToken = null;
        playerEmail = "";
        walletBalance = null;
    }

    function setActorEmail(actor) {
        if (playerEmail && actor && typeof actor.setName === "function") {
            actor.setName(playerEmail);
        }
    }

    function setLeaderEmail() {
        if (typeof $gameParty !== "undefined" &&
            $gameParty &&
            typeof $gameParty.leader === "function") {
            setActorEmail($gameParty.leader());
        }
    }

    function closeOverlay() {
        if (overlay) {
            document.removeEventListener("keydown", stopGameKeyInput, true);
            document.removeEventListener("keyup", stopGameKeyInput, true);
            overlay.remove();
            overlay = null;
        }
        overlayBlocksInterpreter = false;
        if (overlayBgm && overlayBgm.name &&
            typeof AudioManager !== "undefined" &&
            typeof AudioManager.replayBgm === "function") {
            AudioManager.replayBgm(overlayBgm);
        }
        overlayBgm = null;
        if (typeof Input !== "undefined" && typeof Input.clear === "function") {
            Input.clear();
        }
        if (typeof TouchInput !== "undefined" && typeof TouchInput.clear === "function") {
            TouchInput.clear();
        }
    }

    function stopGameKeyInput(event) {
        if (overlay) {
            event.stopImmediatePropagation();
        }
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    function createButton(label, className, onClick) {
        const button = createElement("button", className || "p2r-button", label);
        button.type = "button";
        button.addEventListener("click", onClick);
        return button;
    }

    function appendDiagnosticReport(container, report) {
        const details = createElement("details", "p2r-diagnostic");
        const summary = createElement("summary", "", "Rincian untuk tim P2R");
        const text = createElement("textarea", "p2r-diagnostic-text", report);
        text.readOnly = true;
        text.rows = 10;
        text.setAttribute("aria-label", "Rincian diagnostik API P2R");
        text.style.width = "100%";
        text.style.boxSizing = "border-box";
        text.style.resize = "vertical";
        const copyStatus = createElement("p", "p2r-status", "");
        const copyButton = createButton("Salin rincian", "p2r-button secondary", function() {
            const clipboard = window.navigator && window.navigator.clipboard;
            if (!clipboard || typeof clipboard.writeText !== "function") {
                text.focus();
                text.select();
                copyStatus.textContent = "Salin teks yang sudah dipilih.";
                return;
            }
            clipboard.writeText(report).then(function() {
                copyStatus.textContent = "Rincian berhasil disalin.";
            }).catch(function() {
                text.focus();
                text.select();
                copyStatus.textContent = "Salin teks yang sudah dipilih.";
            });
        });
        details.appendChild(summary);
        details.appendChild(text);
        details.appendChild(copyButton);
        details.appendChild(copyStatus);
        container.appendChild(details);
    }

    function openOverlay(title, blocking) {
        const preservedBgm = overlay && blocking ? overlayBgm : null;
        if (preservedBgm) {
            overlayBgm = null;
        }
        closeOverlay();
        overlayBlocksInterpreter = Boolean(blocking);
        overlay = createElement("div", "p2r-overlay");
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", title);
        if (preservedBgm) {
            overlayBgm = preservedBgm;
        } else if (overlayBlocksInterpreter &&
            typeof AudioManager !== "undefined" &&
            typeof AudioManager.saveBgm === "function" &&
            typeof AudioManager.stopBgm === "function") {
            overlayBgm = AudioManager.saveBgm();
            if (overlayBgm && overlayBgm.name) {
                AudioManager.stopBgm();
            }
        }

        const style = createElement("style");
        style.textContent =
            ".p2r-overlay{position:fixed;top:0;right:0;bottom:0;left:0;width:100%;height:100%;" +
            "z-index:2147483000;display:flex;align-items:center;justify-content:center;" +
            "padding:20px;box-sizing:border-box;background:rgba(8,12,20,.82);overflow-y:auto;" +
            "font-family:GameFont,'Segoe UI',Arial,sans-serif;color:#f5f7fb}" +
            ".p2r-card{box-sizing:border-box;width:100%;max-width:520px;max-height:90vh;" +
            "overflow-y:auto;margin:auto;padding:24px 26px;border:2px solid #4fd6c8;" +
            "border-radius:16px;background:linear-gradient(180deg,#1b1f2a 0%,#10131a 100%);" +
            "box-shadow:0 16px 48px rgba(0,0,0,.68)}" +
            ".p2r-card h2{margin:0 0 12px;font-size:24px;color:#ffffff;letter-spacing:.3px;" +
            "border-bottom:1px solid rgba(79,214,200,.25);padding-bottom:10px}" +
            ".p2r-card p{margin:8px 0;line-height:1.5;overflow-wrap:anywhere}" +
            ".p2r-field{display:block;margin:14px 0;font-size:14px}" +
            ".p2r-field input{display:block;box-sizing:border-box;width:100%;margin-top:7px;" +
            "padding:11px;border:1px solid #748091;border-radius:8px;background:#fff;color:#111;" +
            "font-size:16px}" +
            ".p2r-buttons{display:flex;flex-wrap:wrap;margin:14px -5px 0}" +
            ".p2r-button{margin:5px;padding:10px 15px;border:0;border-radius:8px;background:#4fd6c8;" +
            "color:#10131a;font-weight:bold;font-size:14px;cursor:pointer}" +
            ".p2r-button.secondary{background:#2d3648;color:#f5f7fb;border:1px solid rgba(255,255,255,.12)}" +
            ".p2r-button:disabled{opacity:.5;cursor:not-allowed}" +
            ".p2r-status{min-height:1.4em;font-size:13px;color:#b8c7dc;white-space:pre-line}" +
            ".p2r-result-detail{white-space:pre-line}" +
            ".p2r-lb-wrap{margin:12px 0;border:1px solid rgba(79,214,200,.25);border-radius:10px;" +
            "background:rgba(10,14,22,.55);overflow:hidden}" +
            ".p2r-lb-empty{padding:16px 14px;font-size:14px;color:#cbd5e1;line-height:1.5}" +
            ".p2r-lb-row{display:flex;align-items:center;padding:10px 14px;font-size:15px;" +
            "border-bottom:1px solid rgba(255,255,255,.06)}" +
            ".p2r-lb-row:last-child{border-bottom:0}" +
            ".p2r-lb-row.alt{background:rgba(255,255,255,.04)}" +
            ".p2r-lb-rank{width:46px;flex-shrink:0;font-weight:bold;color:#94a3b8}" +
            ".p2r-lb-rank.r1{color:#ffd700}" +
            ".p2r-lb-rank.r2{color:#d7d7e0}" +
            ".p2r-lb-rank.r3{color:#cd8032}" +
            ".p2r-lb-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:10px}" +
            ".p2r-lb-score{flex-shrink:0;font-weight:bold;color:#4fd6c8}" +
            ".p2r-my-rank{margin:10px 0 4px;padding:10px 12px;border-radius:8px;" +
            "background:rgba(79,214,200,.1);border:1px solid rgba(79,214,200,.35);" +
            "font-size:14px;color:#e2f8f5}" +
            ".p2r-diagnostic{margin-top:14px;font-size:12px;color:#94a3b8}" +
            ".p2r-diagnostic summary{cursor:pointer;margin-bottom:6px}" +
            ".p2r-diagnostic-text{margin-bottom:6px;padding:8px;border-radius:6px;background:#0b0f17;" +
            "color:#cbd5e1;border:1px solid #334155;font-family:monospace;font-size:12px}" +
            ".p2r-status.error{color:#ffb4ab}";

        const card = createElement("section", "p2r-card");
        card.appendChild(createElement("h2", "", title));
        overlay.appendChild(style);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
        document.addEventListener("keydown", stopGameKeyInput, true);
        document.addEventListener("keyup", stopGameKeyInput, true);
        return card;
    }

    function setStatus(card, text, isError) {
        const status = card.querySelector(".p2r-status");
        if (status) {
            status.textContent = text || "";
            status.className = isError ? "p2r-status error" : "p2r-status";
        }
    }

    function showNotice(title, text, buttonLabel, blocking, onClose) {
        showActions(title, text, [{
            label: buttonLabel || "Tutup",
            className: "p2r-button",
            action: function() {
                closeOverlay();
                if (typeof onClose === "function") {
                    onClose();
                }
            }
        }], blocking);
    }

    function showActions(title, text, actions, blocking) {
        const card = openOverlay(title, blocking !== false);
        card.appendChild(createElement("p", "", text));
        const buttons = createElement("div", "p2r-buttons");
        actions.forEach(function(action) {
            buttons.appendChild(createButton(action.label, action.className || "p2r-button", action.action));
        });
        card.appendChild(buttons);
    }

    function openLoginDialog(message, allowDismiss, onContinue) {
        loginContinueAction = typeof onContinue === "function" ? onContinue : null;
        const card = openOverlay("Login Lumina Adventure", true);
        card.appendChild(createElement("p", "", "Masuk dengan akun pemain P2R Anda."));

        const form = createElement("form");
        const emailLabel = createElement("label", "p2r-field", "Email");
        const emailInput = createElement("input");
        emailInput.type = "email";
        emailInput.name = "email";
        emailInput.autocomplete = "email";
        emailInput.required = true;
        emailInput.maxLength = 254;
        emailLabel.appendChild(emailInput);

        const passwordLabel = createElement("label", "p2r-field", "Kata sandi");
        const passwordInput = createElement("input");
        passwordInput.type = "password";
        passwordInput.name = "password";
        passwordInput.autocomplete = "current-password";
        passwordInput.required = true;
        passwordInput.maxLength = 200;
        passwordLabel.appendChild(passwordInput);

        const status = createElement("p", message ? "p2r-status error" : "p2r-status", message || "");
        status.setAttribute("role", "status");
        const buttons = createElement("div", "p2r-buttons");
        const submit = createElement("button", "p2r-button", "Login");
        submit.type = "submit";
        buttons.appendChild(submit);
        if (allowDismiss) {
            buttons.appendChild(createButton("Tutup", "p2r-button secondary", closeOverlay));
        }

        form.appendChild(emailLabel);
        form.appendChild(passwordLabel);
        form.appendChild(status);
        form.appendChild(buttons);
        card.appendChild(form);
        emailInput.focus();

        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            submit.disabled = true;
            status.className = "p2r-status";
            status.textContent = "Memuat...";

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            try {
                const result = await requestApi("/auth/login", {
                    method: "POST",
                    body: { email: email, password: password },
                    loginRequest: true,
                    onRetryNotice: function(seconds) {
                        status.textContent = "Memuat... Menunggu " + seconds + " detik sebelum mencoba lagi.";
                    }
                });
                passwordInput.value = "";
                if (!result.data || !result.data.token) {
                    throw makeApiError("INVALID_RESPONSE", 200);
                }
                playerToken = result.data.token;
                playerEmail = email;
                setLeaderEmail();
                walletBalance = null;
                await refreshWalletInPanel();
            } catch (error) {
                passwordInput.value = "";
                if (overlay && overlay.contains(status)) {
                    setStatus(card, error.message || friendlyError("UNKNOWN"), true);
                    submit.disabled = false;
                    passwordInput.focus();
                }
            }
        });
    }

    function renderProfilePanel(loading, errorMessage, notice) {
        const card = openOverlay("Profil pemain", true);
        card.appendChild(createElement("p", "", "Email akun: " + playerEmail));
        card.appendChild(createElement(
            "p",
            "",
            "Saldo koin: " + (walletBalance === null ? "belum dimuat" : walletBalance + " koin")
        ));

        const statusText = loading
            ? "Memuat..."
            : (errorMessage || notice || "");
        const status = createElement(
            "p",
            errorMessage ? "p2r-status error" : "p2r-status",
            statusText
        );
        status.setAttribute("role", "status");
        card.appendChild(status);

        const buttons = createElement("div", "p2r-buttons");
        const refreshButton = createButton("Muat ulang saldo", "p2r-button secondary", function() {
            refreshWalletInPanel();
        });
        refreshButton.disabled = Boolean(loading);
        buttons.appendChild(refreshButton);

        const continueButton = createButton("Lanjutkan", "p2r-button", continueFromProfile);
        continueButton.disabled = loading || walletBalance === null;
        buttons.appendChild(continueButton);

        const logoutButton = createButton("Logout", "p2r-button secondary", performLogout);
        logoutButton.disabled = Boolean(loading);
        buttons.appendChild(logoutButton);
        card.appendChild(buttons);
    }

    function continueFromProfile() {
        const action = loginContinueAction;
        loginContinueAction = null;
        closeOverlay();
        if (action) {
            Promise.resolve().then(action).catch(function(error) {
                showNotice("P2R", error.message || friendlyError("UNKNOWN"), "Tutup", true);
            });
        }
    }

    async function refreshWalletInPanel() {
        if (!playerToken) {
            openLoginDialog(friendlyError("UNAUTHENTICATED"), false);
            return;
        }

        walletBalance = null;
        renderProfilePanel(true, "", "");
        try {
            const result = await requestApi("/me/wallet", { authenticated: true });
            if (!result.data || !Number.isInteger(result.data.balance) || result.data.balance < 0) {
                throw makeApiError("INVALID_RESPONSE", 200);
            }
            walletBalance = result.data.balance;
            renderProfilePanel(false, "", "");
        } catch (error) {
            if (playerToken) {
                renderProfilePanel(false, error.message || friendlyError("UNKNOWN"), "");
            }
        }
    }

    async function performLogout() {
        if (!playerToken) {
            clearPlayerSession();
            showNotice("Logout", "Tidak ada sesi pemain yang sedang login.", "Tutup", true);
            return;
        }

        const token = playerToken;
        renderProfilePanel(true, "", "Memuat logout...");
        let logoutError = null;
        try {
            await requestApi("/auth/logout", {
                method: "POST",
                authenticated: true,
                triggerLoginOnUnauthorized: false
            });
        } catch (error) {
            logoutError = error;
        }

        if (playerToken === token) {
            clearPlayerSession();
        }

        if (logoutError) {
            showNotice(
                "Logout",
                "Token lokal sudah dihapus, tetapi server belum mengonfirmasi logout. " +
                    (logoutError.message || friendlyError("UNKNOWN")),
                "Tutup",
                true
            );
        } else {
            showNotice("Logout", "Logout berhasil. Token pemain sudah dihapus dari memori game.", "Tutup", true);
        }
    }

    async function logoutAndReturnToTitle() {
        if (!playerToken) {
            clearPlayerSession();
            returnToTitle();
            return;
        }

        const token = playerToken;
        const card = openOverlay("Logout", true);
        card.appendChild(createElement("p", "p2r-status", "Memuat..."));
        try {
            await requestApi("/auth/logout", {
                method: "POST",
                authenticated: true,
                triggerLoginOnUnauthorized: false
            });
            if (playerToken === token) {
                clearPlayerSession();
            }
            returnToTitle();
        } catch (error) {
            if (playerToken === token) {
                clearPlayerSession();
            }
            showActions(
                "Logout",
                "Token lokal sudah dihapus, tetapi server belum mengonfirmasi logout. " +
                    (error.message || friendlyError("UNKNOWN")),
                [{ label: "Ke menu utama", action: returnToTitle }],
                true
            );
        }
    }

    async function showProfile() {
        if (!playerToken) {
            openLoginDialog(friendlyError("UNAUTHENTICATED"), false);
            return;
        }
        await refreshWalletInPanel();
    }

    function reactivateMenuIfNeeded(returnToMenu) {
        if (!returnToMenu ||
            typeof SceneManager === "undefined" ||
            !SceneManager._scene ||
            !SceneManager._scene._commandWindow) {
            return;
        }
        if (typeof Scene_Menu !== "undefined" && SceneManager._scene instanceof Scene_Menu) {
            SceneManager._scene._commandWindow.activate();
        } else if (typeof Scene_Title !== "undefined" && SceneManager._scene instanceof Scene_Title) {
            SceneManager._scene._picComE = false;
            SceneManager._scene._commandWindow.activate();
            SceneManager._scene._commandWindow.open();
        }
    }

    async function checkIntegrationStatus(returnToMenu) {
        const onClose = function() {
            reactivateMenuIfNeeded(returnToMenu);
        };
        showNotice("Status integrasi P2R", "Memuat...", "Tutup", true, onClose);
        try {
            const result = await requestApi(
                "/games/" + encodeURIComponent(gameSlug) + "/integration-status"
            );
            const data = result.data || {};
            const credential = data.credential || {};
            const contract = data.contract || {};
            const connected = credential.authenticated === true && credential.state === "active";
            const activeEvent = data.active_event;
            const eventValue = activeEvent && typeof activeEvent === "object"
                ? activeEvent.event
                : activeEvent;
            const eventName = typeof eventValue === "string"
                ? eventValue
                : eventValue && (eventValue.name || eventValue.title || eventValue.id);
            const eventIsActive = typeof activeEvent === "string"
                ? Boolean(activeEvent)
                : Boolean(activeEvent && activeEvent.active === true);
            const scoreSubmission = data.score_submission || {};
            const statusLines = [
                connected
                    ? "Koneksi proxy dan kredensial game aktif."
                    : friendlyError("INTEGRATION_UNAVAILABLE"),
                "Kontrak: " + (contract.version || "belum tersedia"),
                "Event aktif: " + (eventIsActive ? (eventName || "ya") : "belum aktif"),
                "Status pengiriman skor: " + (scoreSubmission.state || "belum diketahui")
            ];
            if (scoreSubmission.reason) {
                statusLines.push("Keterangan: " + scoreSubmission.reason);
            }
            const text = statusLines.join("\n");
            showNotice("Status integrasi P2R", text, "Tutup", true, onClose);
        } catch (error) {
            showNotice(
                "Status integrasi P2R",
                error.message || friendlyError("INTEGRATION_UNAVAILABLE"),
                "Tutup",
                true,
                onClose
            );
        }
    }

    function createUuidV4() {
        const cryptoApi = window.crypto || window.msCrypto;
        if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
            throw makeApiError("UUID_UNAVAILABLE", 0);
        }
        const bytes = new Uint8Array(16);
        cryptoApi.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, function(value) {
            return value.toString(16).padStart(2, "0");
        }).join("");
        return [
            hex.slice(0, 8),
            hex.slice(8, 12),
            hex.slice(12, 16),
            hex.slice(16, 20),
            hex.slice(20)
        ].join("-");
    }

    function configuredEconomyActions(gameResponse) {
        const config = gameResponse && gameResponse.data && gameResponse.data.config;
        const actions = config && config.economy_actions;
        if (!Array.isArray(actions)) {
            throw makeApiError("INVALID_RESPONSE", 200);
        }
        return actions;
    }

    function economyAction(actionCode) {
        return gameEconomyActions.find(function(action) {
            return action && action.action_code === actionCode;
        }) || null;
    }

    function economyActionCost(actionCode) {
        const action = economyAction(actionCode);
        if (!action) {
            return null;
        }
        const cost = Number(action.coin_cost);
        return Number.isInteger(cost) && cost >= 0 ? cost : null;
    }

    function sessionStartCost(gameResponse) {
        const actions = configuredEconomyActions(gameResponse);
        const action = actions.find(function(item) {
            return item && item.action_code === "session_start";
        });
        if (!action) {
            return 0;
        }
        const cost = Number(action.coin_cost);
        if (!Number.isInteger(cost) || cost < 0) {
            throw makeApiError("INVALID_RESPONSE", 200);
        }
        return cost;
    }

    function returnToTitle() {
        startTransferPending = false;
        pendingStartRequest = null;
        closeOverlay();
        if (typeof SceneManager !== "undefined" && typeof Scene_Title !== "undefined") {
            SceneManager.goto(Scene_Title);
        }
    }

    async function startRunFlow(onStarted) {
        if (activeRun) {
            if (typeof onStarted === "function") {
                onStarted();
            } else {
                showNotice("Run P2R", "Run sudah aktif.", "Lanjutkan", true);
            }
            return;
        }

        if (!playerToken) {
            openLoginDialog(
                "Login diperlukan sebelum permainan dimulai.",
                false,
                function() {
                    startRunFlow(onStarted);
                }
            );
            return;
        }

        const card = openOverlay("Memulai run", true);
        const status = createElement("p", "p2r-status", "Memuat saldo dan biaya masuk...");
        status.setAttribute("role", "status");
        card.appendChild(status);

        try {
            if (!pendingStartRequest) {
                const results = await Promise.all([
                    requestApi("/me/wallet", { authenticated: true }),
                    requestApi("/games/" + encodeURIComponent(gameSlug))
                ]);
                const wallet = results[0] && results[0].data;
                if (!wallet || !Number.isInteger(wallet.balance) || wallet.balance < 0) {
                    throw makeApiError("INVALID_RESPONSE", 200);
                }

                gameEconomyActions = configuredEconomyActions(results[1]);
                const coinCost = sessionStartCost(results[1]);
                if (wallet.balance < coinCost) {
                    const insufficient = makeApiError("INSUFFICIENT_COIN", 422);
                    insufficient.balance = wallet.balance;
                    insufficient.coinCost = coinCost;
                    throw insufficient;
                }

                const body = {
                    idempotency_key: createUuidV4(),
                    platform: platform,
                    game_version: gameVersion
                };
                if (eventId) {
                    body.event_id = eventId;
                }
                pendingStartRequest = { body: body, coinCost: coinCost };
            }

            status.textContent = pendingStartRequest.coinCost > 0
                ? "Memuat... Biaya masuk yang dikonfigurasi: " +
                    pendingStartRequest.coinCost + " koin."
                : "Memuat... Tidak ada biaya masuk yang dikonfigurasi.";

            const response = await requestApi(
                "/games/" + encodeURIComponent(gameSlug) + "/sessions/start",
                {
                    method: "POST",
                    authenticated: true,
                    body: pendingStartRequest.body,
                    onRetryNotice: function(seconds) {
                        status.textContent = "Memuat... Menunggu " + seconds +
                            " detik sebelum mencoba ulang.";
                    }
                }
            );
            const data = response && response.data;
            const session = data && data.session;
            if (!session || !session.id || !data.session_token) {
                throw makeApiError("INVALID_RESPONSE", 201);
            }

            const costPaid = pendingStartRequest.coinCost;
            activeRun = {
                sessionId: session.id,
                sessionToken: data.session_token,
                expiresAt: session.expires_at || data.expires_at || "",
                rounds: [],
                currentRound: null
            };
            pendingStartRequest = null;
            pendingRevive = null;
            if (typeof $gameVariables !== "undefined") {
                $gameVariables.setValue(scoreVariableId, 0);
            }

            startTransferPending = false;
            if (typeof onStarted === "function") {
                closeOverlay();
                onStarted();
            } else {
                showNotice(
                    "Run dimulai",
                    costPaid === 0
                        ? "Sesi P2R aktif. Tidak ada biaya masuk yang dikonfigurasi."
                        : "Sesi P2R aktif. Biaya masuk dipotong otomatis oleh P2R.",
                    "Lanjutkan",
                    true
                );
            }
        } catch (error) {
            if (error.code === "UNAUTHENTICATED") {
                loginContinueAction = function() {
                    startRunFlow(onStarted);
                };
                return;
            }

            if (error.code === "INSUFFICIENT_COIN") {
                pendingStartRequest = null;
                const balance = Number.isInteger(error.balance) ? error.balance : 0;
                const cost = Number.isInteger(error.coinCost) ? error.coinCost : 0;
                const text = error.balance === undefined
                    ? friendlyError("INSUFFICIENT_COIN")
                    : "Koin tidak cukup. Saldo " + balance + " koin, sedangkan biaya masuk " +
                        cost + " koin. Top up, lalu coba lagi.";
                showActions("Koin tidak cukup", text, [
                    {
                        label: "Cek lagi",
                        className: "p2r-button",
                        action: function() {
                            startRunFlow(onStarted);
                        }
                    },
                    {
                        label: "Kembali ke judul",
                        className: "p2r-button secondary",
                        action: returnToTitle
                    }
                ], true);
                return;
            }

            const retryText = error.message || friendlyError("UNKNOWN");
            showActions("Run belum dimulai", retryText, [
                {
                    label: "Coba lagi",
                    className: "p2r-button",
                    action: function() {
                        startRunFlow(onStarted);
                    }
                },
                {
                    label: "Kembali ke judul",
                    className: "p2r-button secondary",
                    action: returnToTitle
                }
            ], true);
        }
    }

    function updateScoreVariable() {
        if (activeRun && typeof $gameVariables !== "undefined") {
            $gameVariables.setValue(scoreVariableId, scoreFromRounds(activeRun.rounds));
        }
    }

    function roundAccuracy(round) {
        const total = round.perfect + round.great + round.good + round.miss;
        if (total <= 0) {
            return 0;
        }
        const weighted = round.perfect * 100 + round.great * 70 + round.good * 40;
        return weighted / (total * 100);
    }

    function scoreFromRounds(rounds) {
        if (!rounds || rounds.length === 0) {
            return 0;
        }
        const roundMaximum = maximumRunScore / roundsPerRun;
        const unrounded = rounds.reduce(function(total, round) {
            return total + roundMaximum * roundAccuracy(round);
        }, 0);
        return Math.max(0, Math.min(maximumRunScore, Math.round(unrounded)));
    }

    function createRoundStats() {
        return {
            startedAt: Date.now(),
            perfect: 0,
            great: 0,
            good: 0,
            miss: 0
        };
    }

    function recordRoundAccuracy(rating) {
        if (!activeRun || !activeRun.currentRound) {
            return;
        }
        if (typeof $gameSystem !== "undefined" && $gameSystem._theatrhythm_phase !== 1) {
            return;
        }
        activeRun.currentRound[rating] += 1;
    }

    function finishCurrentRound() {
        if (!activeRun || !activeRun.currentRound) {
            return;
        }
        const stats = activeRun.currentRound;
        const round = {
            duration: Math.max(0, Math.round((Date.now() - stats.startedAt) / 1000)),
            perfect: stats.perfect,
            great: stats.great,
            good: stats.good,
            miss: stats.miss
        };
        activeRun.rounds.push(round);
        activeRun.currentRound = null;
        updateScoreVariable();
    }

    function totalRoundCounts(rounds) {
        return rounds.reduce(function(total, round) {
            total.perfect += round.perfect;
            total.great += round.great;
            total.good += round.good;
            total.miss += round.miss;
            return total;
        }, { perfect: 0, great: 0, good: 0, miss: 0 });
    }

    function resultDetails(rounds) {
        const counts = totalRoundCounts(rounds);
        const inputs = counts.perfect + counts.great + counts.good + counts.miss;
        return "Ronde rhythm: " + rounds.length +
            "\nPerfect: " + counts.perfect +
            "\nGreat: " + counts.great +
            "\nGood: " + counts.good +
            "\nMiss: " + counts.miss +
            "\nTotal input: " + inputs;
    }

    function completionPayload(run) {
        const score = scoreFromRounds(run.rounds);
        const roundMaximum = maximumRunScore / roundsPerRun;
        const roundData = run.rounds.map(function(round, index) {
            return {
                round: index + 1,
                duration: round.duration,
                perfect: round.perfect,
                great: round.great,
                good: round.good,
                miss: round.miss,
                total_inputs: round.perfect + round.great + round.good + round.miss,
                score: Number((roundMaximum * roundAccuracy(round)).toFixed(2))
            };
        });
        const body = {
            session_token: run.sessionToken,
            best_score: score,
            data: {
                rounds: roundData,
                total_score: score
            },
            metadata: {
                platform: platform,
                game_version: gameVersion
            },
            contract_version: contractVersion
        };
        return {
            sessionId: run.sessionId,
            expiresAt: run.expiresAt,
            score: score,
            rounds: run.rounds.map(function(round) {
                return Object.assign({}, round);
            }),
            body: body
        };
    }

    function showRunResult(message, retryAvailable, resultOverride, diagnostic) {
        const result = resultOverride || pendingCompletion;
        if (!result) {
            showNotice("Hasil run", message || "Belum ada hasil run.", "Tutup", true);
            return;
        }

        const card = openOverlay("Hasil Lumina Adventure", true);
        card.appendChild(createElement("p", "", "Skor akhir: " + result.score + " / 600"));
        const details = createElement("p", "p2r-result-detail", resultDetails(result.rounds));
        card.appendChild(details);
        if (message) {
            const status = createElement("p", "p2r-status", message);
            status.setAttribute("role", "status");
            card.appendChild(status);
        }
        const buttons = createElement("div", "p2r-buttons");
        if (retryAvailable) {
            buttons.appendChild(createButton("Coba kirim lagi", "p2r-button", sendPendingCompletion));
        }
        buttons.appendChild(createButton("Leaderboard P2R", "p2r-button", function() {
            showLeaderboard(10, 0, false, function() {
                showRunResult(message, retryAvailable, result, diagnostic);
            });
        }));
        if (typeof Scene_LuminaComplete !== "undefined" &&
            typeof SceneManager !== "undefined" &&
            SceneManager._scene instanceof Scene_LuminaComplete) {
            buttons.appendChild(createButton("Tutup", "p2r-button secondary", closeOverlay));
        }
        buttons.appendChild(createButton("Menu utama", "p2r-button secondary", returnToTitle));
        buttons.appendChild(createButton(
            "Logout & menu utama",
            "p2r-button secondary",
            logoutAndReturnToTitle
        ));
        card.appendChild(buttons);
        if (diagnostic) {
            appendDiagnosticReport(card, diagnostic);
        }
    }

    function normalizeLeaderboardLimit(value) {
        const limit = Number(value);
        return Number.isInteger(limit) ? Math.max(1, Math.min(100, limit)) : 10;
    }

    function normalizeLeaderboardOffset(value) {
        const offset = Number(value);
        return Number.isInteger(offset) ? Math.max(0, offset) : 0;
    }

    async function fetchLeaderboardData(limit, offset) {
        let query = "?limit=" + limit + "&offset=" + offset;
        if (eventId) {
            query += "&event_id=" + encodeURIComponent(eventId);
        }
        const path = "/games/" + encodeURIComponent(gameSlug) + "/leaderboard" + query;
        let httpStatus = 0;
        const response = await requestApi(
            path,
            {
                optionalPlayerAuth: true,
                onResponse: function(status) {
                    httpStatus = status;
                }
            }
        );
        if (!response.data || !Array.isArray(response.data.leaderboard)) {
            throw makeApiError(
                "INVALID_RESPONSE",
                httpStatus,
                requestDiagnostic("GET", path, httpStatus, "INVALID_RESPONSE", response)
            );
        }
        Object.defineProperty(response.data, "_p2rHttpStatus", {
            value: httpStatus,
            enumerable: false
        });
        Object.defineProperty(response.data, "_p2rRequestPath", {
            value: path,
            enumerable: false
        });
        return response.data;
    }

    function emptyLeaderboardDiagnostic(data, score) {
        const myRank = data.my_rank;
        const scoreWasSubmitted = score !== null && score !== undefined;
        const currentScore = scoreWasSubmitted
            ? score
            : (typeof $gameVariables !== "undefined"
                ? $gameVariables.value(scoreVariableId)
                : null);
        const myRankInfo = myRank && typeof myRank === "object"
            ? {
                rank: myRank.rank || myRank.position || null,
                score: myRank.best_score !== undefined ? myRank.best_score : myRank.score
            }
            : myRank || null;
        return diagnosticReport({
            timestamp: new Date().toISOString(),
            operation: "Memeriksa leaderboard",
            request: {
                method: "GET",
                path: "/api/v1" + (data._p2rRequestPath ||
                    "/games/" + encodeURIComponent(gameSlug) + "/leaderboard"),
                http_status: data._p2rHttpStatus || 0,
                event_id: eventId || null
            },
            submission: {
                status: scoreWasSubmitted
                    ? "request complete-session berhasil"
                    : (activeRun
                        ? "belum dikirim; sesi P2R masih aktif"
                        : "tidak ada status pengiriman pada layar ini"),
                score: currentScore,
                submitted: scoreWasSubmitted
            },
            result: {
                event: data.event === undefined ? null : data.event,
                total_players: data.total_players === undefined ? null : data.total_players,
                returned_entries: data.leaderboard.length,
                my_rank: myRankInfo
            }
        });
    }

    function leaderboardRankText(rank) {
        if (rank === null || rank === undefined) {
            return "Peringkat kamu: belum tersedia.";
        }
        const numericRank = Number(rank);
        if (Number.isFinite(numericRank) && numericRank > 0) {
            return "Peringkat kamu: #" + numericRank + ".";
        }
        if (typeof rank === "object") {
            const position = Number(rank.rank || rank.position || rank.my_rank);
            if (Number.isFinite(position) && position > 0) {
                return "Peringkat kamu: #" + position + ".";
            }
        }
        return "Peringkat kamu: belum tersedia.";
    }

    function leaderboardEntryFields(entry, index, offset) {
        const rank = Number(entry.rank || entry.position) || offset + index + 1;
        const player = entry.player_name ||
            entry.name ||
            entry.username ||
            entry.display_name ||
            (entry.user && (entry.user.name || entry.user.username || entry.user.email)) ||
            (entry.player && (entry.player.name || entry.player.username || entry.player.email)) ||
            "Pemain";
        const scoreValue = entry.best_score !== undefined ? entry.best_score : entry.score;
        const score = Number(scoreValue);
        return {
            rank: rank,
            player: String(player),
            scoreText: Number.isFinite(score) ? score + " poin" : "—"
        };
    }

    function renderLeaderboardRows(container, entries, offset) {
        container.textContent = "";
        entries.forEach(function(entry, index) {
            const fields = leaderboardEntryFields(entry, index, offset);
            const rowClass = index % 2 === 1 ? "p2r-lb-row alt" : "p2r-lb-row";
            const row = createElement("div", rowClass);
            const rankClass = fields.rank >= 1 && fields.rank <= 3
                ? "p2r-lb-rank r" + fields.rank
                : "p2r-lb-rank";
            row.appendChild(createElement("span", rankClass, "#" + fields.rank));
            row.appendChild(createElement("span", "p2r-lb-name", fields.player));
            row.appendChild(createElement("span", "p2r-lb-score", fields.scoreText));
            container.appendChild(row);
        });
    }

    function showLeaderboard(limitValue, offsetValue, returnToMenu, onClose) {
        const limit = normalizeLeaderboardLimit(limitValue);
        const offset = normalizeLeaderboardOffset(offsetValue);
        const card = openOverlay("Leaderboard P2R", true);
        const status = createElement("p", "p2r-status", "Memuat...");
        const list = createElement("div", "p2r-lb-wrap");
        list.appendChild(createElement("div", "p2r-lb-empty", "Mengambil data peringkat..."));
        const rank = createElement("div", "p2r-my-rank", "Peringkat kamu: memuat...");
        card.appendChild(status);
        card.appendChild(list);
        card.appendChild(rank);

        const buttons = createElement("div", "p2r-buttons");
        const previousButton = createButton(
            "Sebelumnya",
            "p2r-button secondary",
            function() {
                showLeaderboard(limit, Math.max(0, offset - limit), returnToMenu, onClose);
            }
        );
        previousButton.disabled = true;
        buttons.appendChild(previousButton);
        const refreshButton = createButton("Muat ulang", "p2r-button", function() {
            showLeaderboard(limit, offset, returnToMenu, onClose);
        });
        refreshButton.disabled = true;
        buttons.appendChild(refreshButton);
        const nextButton = createButton("Berikutnya", "p2r-button secondary", function() {
            showLeaderboard(limit, offset + limit, returnToMenu, onClose);
        });
        nextButton.disabled = true;
        buttons.appendChild(nextButton);
        const closeLabel = onClose
            ? "Kembali ke hasil"
            : (returnToMenu ? "Kembali ke menu" : "Tutup");
        buttons.appendChild(createButton(closeLabel, "p2r-button secondary", function() {
            closeOverlay();
            if (typeof onClose === "function") {
                onClose();
                return;
            }
            reactivateMenuIfNeeded(returnToMenu);
        }));
        card.appendChild(buttons);

        fetchLeaderboardData(limit, offset).then(function(data) {
            const eventLabel = data.event && typeof data.event === "object"
                ? (data.event.name || data.event.slug || data.event.id)
                : (typeof data.event === "string" ? data.event : "");
            status.textContent = "API P2R merespons (HTTP " +
                data._p2rHttpStatus + ")" +
                (eventLabel ? " · Event: " + eventLabel : " · Event: belum aktif") + ".";
            rank.textContent = leaderboardRankText(data.my_rank);
            if (data.leaderboard.length === 0) {
                list.textContent = "";
                const emptyText = activeRun
                    ? ("Skor run ini belum dikirim: sesi P2R masih aktif. " +
                        "Skor dikirim saat run selesai." +
                        (data.event === null
                            ? " Respons API juga menunjukkan event=null; periksa pengaturan event."
                            : ""))
                    : (data.event === null
                        ? "Belum ada skor. Event belum aktif atau belum memiliki peserta."
                        : "Belum ada skor.");
                list.appendChild(createElement("div", "p2r-lb-empty", emptyText));
                appendDiagnosticReport(card, emptyLeaderboardDiagnostic(data, null));
            } else {
                renderLeaderboardRows(list, data.leaderboard, offset);
            }
            previousButton.disabled = offset === 0;
            refreshButton.disabled = false;
            const totalPlayers = Number(data.total_players);
            nextButton.disabled = Number.isFinite(totalPlayers)
                ? offset + limit >= totalPlayers
                : data.leaderboard.length < limit;
        }).catch(function(error) {
            status.className = "p2r-status error";
            status.textContent = error.message || friendlyError("UNKNOWN");
            list.textContent = "";
            list.appendChild(createElement("div", "p2r-lb-empty", "Gagal memuat daftar peringkat."));
            rank.textContent = "Peringkat kamu: belum tersedia.";
            previousButton.disabled = offset === 0;
            refreshButton.disabled = false;
            appendDiagnosticReport(
                card,
                errorDiagnosticReport(error, "GET leaderboard", {
                    game_slug: gameSlug,
                    event_id: eventId || null
                })
            );
        });
    }

    function leaderboardResultMessage(data) {
        if (!data || data.leaderboard.length === 0) {
            return "Skor berhasil dikirim ke API, tetapi leaderboard masih kosong. " +
                "Periksa event aktif dan event_id.";
        }
        return "Skor berhasil dikirim. " + leaderboardRankText(data.my_rank);
    }

    function finishRhythmWithoutRevive(revive) {
        if (!revive) {
            return;
        }
        pendingRevive = null;
        closeOverlay();
        revive.originalBattleEnd.call(revive.scene, 11);
    }

    function canRestoreRhythmParty(scene) {
        return Array.isArray(scene._party_hp) &&
            Array.isArray(scene._battlers) &&
            scene._battlers.length > 0 &&
            scene._battlers.every(function(battler) {
                return battler &&
                    Number.isFinite(Number(battler.mhp)) &&
                    Number(battler.mhp) > 0 &&
                    typeof battler.gainHp === "function";
            });
    }

    function restoreRhythmParty(scene) {
        const battlers = Array.isArray(scene._battlers)
            ? scene._battlers.filter(Boolean)
            : [];
        if (battlers.length === 0) {
            return false;
        }

        let currentTotal = 0;
        let maximumTotal = 0;
        battlers.forEach(function(battler) {
            const maximumHp = Number(battler.mhp);
            if (!Number.isFinite(maximumHp) || maximumHp <= 0) {
                return;
            }
            const minimumReviveHp = Math.max(1, Math.ceil(maximumHp * 0.25));
            const currentHp = Number(battler.hp) || 0;
            if (currentHp < minimumReviveHp) {
                battler.gainHp(minimumReviveHp - currentHp);
            }
            currentTotal += battler.hp;
            maximumTotal += maximumHp;
        });

        if (maximumTotal <= 0) {
            return false;
        }
        scene._party_hp[0] = currentTotal / battlers.length;
        scene._party_hp[1] = maximumTotal / battlers.length;
        $gameSystem._theatrhythm_phase = 1;
        $gameSystem._theatrhythm_miss_dmg = false;
        return scene._party_hp[0] > 0;
    }

    function showExtraLifePrompt(revive, message, retryAvailable) {
        const card = openOverlay("Extra Life", true);
        card.appendChild(createElement(
            "p",
            "",
            "Bayar " + revive.coinCost +
                " koin untuk bangkit dengan 25% HP party dan lanjut di ronde ini?"
        ));
        if (message) {
            const status = createElement("p", "p2r-status error", message);
            status.setAttribute("role", "status");
            card.appendChild(status);
        }

        const buttons = createElement("div", "p2r-buttons");
        if (retryAvailable) {
            buttons.appendChild(createButton("Coba lagi", "p2r-button", function() {
                sendExtraLifeSpend(revive);
            }));
        } else if (!message) {
            buttons.appendChild(createButton("Bayar dan bangkit", "p2r-button", function() {
                sendExtraLifeSpend(revive);
            }));
        }
        buttons.appendChild(createButton(
            "Lanjut tanpa Extra Life",
            "p2r-button secondary",
            function() {
                finishRhythmWithoutRevive(revive);
            }
        ));
        card.appendChild(buttons);
    }

    async function sendExtraLifeSpend(revive) {
        if (pendingRevive !== revive) {
            return;
        }
        if (!playerToken) {
            openLoginDialog(
                friendlyError("UNAUTHENTICATED"),
                false,
                function() {
                    sendExtraLifeSpend(revive);
                }
            );
            return;
        }
        if (!revive.body) {
            revive.body = {
                action_code: "extra_life",
                idempotency_key: createUuidV4(),
                session_id: activeRun.sessionId
            };
        }

        const card = openOverlay("Memuat Extra Life", true);
        card.appendChild(createElement("p", "p2r-status", "Memuat..."));
        try {
            await requestApi(
                "/games/" + encodeURIComponent(gameSlug) + "/economy/spend",
                {
                    method: "POST",
                    authenticated: true,
                    body: revive.body
                }
            );
            if (pendingRevive !== revive) {
                return;
            }
            if (!restoreRhythmParty(revive.scene)) {
                finishRhythmWithoutRevive(revive);
                return;
            }
            pendingRevive = null;
            walletBalance = null;
            closeOverlay();
        } catch (error) {
            if (error.code === "UNAUTHENTICATED") {
                loginContinueAction = function() {
                    sendExtraLifeSpend(revive);
                };
                return;
            }
            if (error.code === "ECONOMY_ACTION_NOT_CONFIGURED") {
                gameEconomyActions = gameEconomyActions.filter(function(action) {
                    return action.action_code !== "extra_life";
                });
            }
            if (error.code === "INSUFFICIENT_COIN") {
                revive.body = null;
            }
            const retryAvailable =
                error.code === "NETWORK_UNAVAILABLE" ||
                error.code === "UPSTREAM_UNAVAILABLE" ||
                error.code === "UPSTREAM_TIMEOUT" ||
                error.code === "RATE_LIMIT_EXCEEDED" ||
                error.code === "INSUFFICIENT_COIN";
            showExtraLifePrompt(
                revive,
                error.message || friendlyError("UNKNOWN"),
                retryAvailable
            );
        }
    }

    async function sendPendingCompletion() {
        if (!pendingCompletion) {
            showNotice("Hasil run", "Tidak ada skor yang menunggu untuk dikirim.", "Tutup", true);
            return;
        }
        if (!playerToken) {
            openLoginDialog(
                friendlyError("UNAUTHENTICATED"),
                false,
                function() {
                    sendPendingCompletion();
                }
            );
            return;
        }
        if (activeRun && activeRun.expiresAt) {
            const expirationTime = Date.parse(activeRun.expiresAt);
            if (Number.isFinite(expirationTime) && Date.now() >= expirationTime) {
                const expiredResult = pendingCompletion;
                activeRun = null;
                pendingCompletion = null;
                showRunResult(friendlyError("SESSION_EXPIRED"), false, expiredResult);
                return;
            }
        }

        const submission = pendingCompletion;
        const card = openOverlay("Mengirim skor", true);
        card.appendChild(createElement("p", "p2r-status", "Memuat..."));
        try {
            await requestApi(
                "/games/" + encodeURIComponent(gameSlug) + "/sessions/" +
                    encodeURIComponent(submission.sessionId) + "/complete",
                {
                    method: "POST",
                    authenticated: true,
                    body: submission.body,
                    onRetryNotice: function(seconds) {
                        const status = card.querySelector(".p2r-status");
                        if (status) {
                            status.textContent = "Memuat... Menunggu " + seconds +
                                " detik sebelum mencoba ulang.";
                        }
                    }
                }
            );
            activeRun = null;
            pendingCompletion = null;
            let resultMessage = "Skor berhasil dikirim ke P2R.";
            let diagnostic = null;
            try {
                const leaderboard = await fetchLeaderboardData(10, 0);
                resultMessage = leaderboardResultMessage(leaderboard);
                if (leaderboard.leaderboard.length === 0) {
                    diagnostic = emptyLeaderboardDiagnostic(leaderboard, submission.score);
                }
            } catch (leaderboardError) {
                resultMessage += " Peringkat belum dapat dimuat: " +
                    (leaderboardError.message || friendlyError("UNKNOWN")) +
                    " Buka menu leaderboard untuk mencoba lagi.";
                diagnostic = errorDiagnosticReport(
                    leaderboardError,
                    "GET leaderboard setelah complete-session berhasil",
                    {
                        game_slug: gameSlug,
                        event_id: eventId || null,
                        submitted_score: submission.score
                    }
                );
            }
            showRunResult(resultMessage, false, submission, diagnostic);
        } catch (error) {
            if (error.code === "UNAUTHENTICATED") {
                loginContinueAction = function() {
                    sendPendingCompletion();
                };
                return;
            }
            if (error.code === "SESSION_EXPIRED" || error.code === "SESSION_NOT_ACTIVE") {
                activeRun = null;
                pendingCompletion = null;
                showRunResult(error.message || friendlyError(error.code), false, submission);
                return;
            }
            showRunResult(
                "Skor belum terkirim. Data run masih disimpan sementara. " +
                    (error.message || friendlyError("UNKNOWN")),
                error.code === "NETWORK_UNAVAILABLE" ||
                    error.code === "UPSTREAM_UNAVAILABLE" ||
                    error.code === "UPSTREAM_TIMEOUT" ||
                    error.code === "RATE_LIMIT_EXCEEDED",
                undefined,
                errorDiagnosticReport(error, "POST complete-session", {
                    game_slug: gameSlug,
                    event_id: eventId || null,
                    submitted_score: pendingCompletion && pendingCompletion.score,
                    rounds: pendingCompletion && pendingCompletion.rounds.length
                })
            );
        }
    }

    async function completeRun() {
        if (!activeRun && pendingCompletion) {
            return sendPendingCompletion();
        }
        if (!activeRun) {
            showNotice("Hasil run", "Tidak ada sesi P2R aktif.", "Tutup", true);
            return;
        }
        finishCurrentRound();
        updateScoreVariable();
        pendingCompletion = completionPayload(activeRun);
        await sendPendingCompletion();
    }

    async function retryComplete() {
        if (!pendingCompletion) {
            showNotice("Kirim skor", "Tidak ada skor yang menunggu untuk dikirim.", "Tutup", true);
            return;
        }
        await sendPendingCompletion();
    }

    if (typeof Scene_Theatrhythm !== "undefined" &&
        typeof Sprite_TKeys !== "undefined" &&
        Scene_Theatrhythm.prototype &&
        Sprite_TKeys.prototype) {
        const originalTheatrhythmInitialize = Scene_Theatrhythm.prototype.initialize;
        Scene_Theatrhythm.prototype.initialize = function() {
            originalTheatrhythmInitialize.apply(this, arguments);
            if (activeRun) {
                if (activeRun.currentRound) {
                    finishCurrentRound();
                }
                activeRun.currentRound = createRoundStats();
            }
        };

        const originalTheatrhythmTerminate = Scene_Theatrhythm.prototype.terminate;
        Scene_Theatrhythm.prototype.terminate = function() {
            finishCurrentRound();
            originalTheatrhythmTerminate.apply(this, arguments);
        };

        const originalGainRewards = Scene_Theatrhythm.prototype.gain_rewards;
        Scene_Theatrhythm.prototype.gain_rewards = function() {
            const oldVariableId = $gameSystem._theatrhythm_variableID;
            $gameSystem._theatrhythm_variableID = 0;
            try {
                originalGainRewards.apply(this, arguments);
            } finally {
                $gameSystem._theatrhythm_variableID = oldVariableId;
            }
        };

        const originalExecuteOk = Sprite_TKeys.prototype.execute_ok;
        Sprite_TKeys.prototype.execute_ok = function(index, key) {
            const position = this._keys[index].x;
            let rating = "good";
            if (this.checkKey(key, index, 1)) {
                rating = "perfect";
            } else {
                const center = (this._limit[0] + this._limit[1]) / 2;
                const halfWindow = (this._limit[1] - this._limit[0]) / 2;
                const offsetRatio = halfWindow > 0
                    ? Math.abs(position - center) / halfWindow
                    : 1;
                rating = offsetRatio <= 0.55 ? "great" : "good";
            }
            const hadPendingKey = $gameSystem._theatrhythm_key_data[0] !== null;
            originalExecuteOk.call(this, index, key);
            if (!hadPendingKey && $gameSystem._theatrhythm_key_data[0] !== null) {
                recordRoundAccuracy(rating);
            }
        };

        const originalExecuteMissDamage = Scene_Theatrhythm.prototype.execute_miss_damage;
        Scene_Theatrhythm.prototype.execute_miss_damage = function() {
            recordRoundAccuracy("miss");
            originalExecuteMissDamage.apply(this, arguments);
        };

        const originalBattleEnd = Scene_Theatrhythm.prototype.battle_end;
        Scene_Theatrhythm.prototype.battle_end = function(type) {
            const coinCost = type === 11 &&
                activeRun &&
                $gameSystem._theatrhythm_phase === 1
                ? economyActionCost("extra_life")
                : null;
            if (coinCost === null || !canRestoreRhythmParty(this)) {
                return originalBattleEnd.apply(this, arguments);
            }

            pendingRevive = {
                scene: this,
                originalBattleEnd: originalBattleEnd,
                coinCost: coinCost,
                body: null
            };
            showExtraLifePrompt(pendingRevive, "", false);
        };
    }

    if (typeof Game_Player !== "undefined" && Game_Player.prototype) {
        const originalReserveTransfer = Game_Player.prototype.reserveTransfer;
        Game_Player.prototype.reserveTransfer = function(mapId) {
            const isLeavingCharacterSelect =
                typeof $gameMap !== "undefined" &&
                $gameMap.mapId() === 1 &&
                Number(mapId) === 8;
            if (isLeavingCharacterSelect && !activeRun && !startTransferPending) {
                startTransferPending = true;
                const player = this;
                const transferArguments = arguments;
                startRunFlow(function() {
                    originalReserveTransfer.apply(player, transferArguments);
                });
                return;
            }
            originalReserveTransfer.apply(this, arguments);
        };
    }

    if (typeof Scene_Title !== "undefined" && Scene_Title.prototype) {
        const originalTitleStart = Scene_Title.prototype.start;
        Scene_Title.prototype.start = function() {
            originalTitleStart.apply(this, arguments);
            if (activeRun && !pendingCompletion) {
                completeRun();
            }
        };
    }

    if (typeof Scene_Gameover !== "undefined" && Scene_Gameover.prototype) {
        const originalGameoverStart = Scene_Gameover.prototype.start;
        Scene_Gameover.prototype.start = function() {
            originalGameoverStart.apply(this, arguments);
            if (activeRun && !pendingCompletion) {
                completeRun();
            }
        };
    }

    if (typeof Scene_LuminaComplete !== "undefined" && Scene_LuminaComplete.prototype) {
        const originalLuminaCompleteStart = Scene_LuminaComplete.prototype.start;
        Scene_LuminaComplete.prototype.start = function() {
            originalLuminaCompleteStart.apply(this, arguments);
            if (activeRun && !pendingCompletion) {
                completeRun();
            }
        };
    }

    if (typeof SceneManager !== "undefined" &&
        typeof SceneManager.updateMain === "function") {
        const originalUpdateMain = SceneManager.updateMain;
        SceneManager.updateMain = function() {
            if (overlay && overlayBlocksInterpreter) {
                return;
            }
            return originalUpdateMain.apply(this, arguments);
        };
    }

    if (typeof PluginManager.callCommand === "function") {
        const originalCallCommand = PluginManager.callCommand;
        PluginManager.callCommand = function(interpreter, calledPluginName, commandName, args) {
            if (calledPluginName === "TRW_Leaderboard" &&
                commandName === "addScore" &&
                args &&
                args.score === "\\v[1]") {
                args = Object.assign({}, args, { score: "\\v[" + scoreVariableId + "]" });
            }
            return originalCallCommand.call(this, interpreter, calledPluginName, commandName, args);
        };
    }

    function runBlockingCommand(interpreter, operation) {
        if (interpreter && typeof interpreter.setWaitMode === "function") {
            interpreter.setWaitMode("p2rIntegration");
        }
        pendingCommands += 1;
        Promise.resolve()
            .then(operation)
            .catch(function(error) {
                showNotice("P2R", error.message || friendlyError("UNKNOWN"), "Tutup", true);
            })
            .finally(function() {
                pendingCommands = Math.max(0, pendingCommands - 1);
            });
    }

    if (typeof Game_Interpreter !== "undefined" && Game_Interpreter.prototype) {
        previousWaitMode = Game_Interpreter.prototype.updateWaitMode;
        Game_Interpreter.prototype.updateWaitMode = function() {
            if (this._waitMode === "p2rIntegration") {
                if (pendingCommands > 0 || overlayBlocksInterpreter) {
                    return true;
                }
                this._waitMode = "";
                return false;
            }
            return previousWaitMode.call(this);
        };

        Game_Interpreter.prototype.command303 = function(params) {
            const actorId = params && params[0];
            const actor = typeof $gameActors !== "undefined" && $gameActors
                ? $gameActors.actor(actorId)
                : null;
            setActorEmail(actor);
            return true;
        };
    }

    if (typeof Scene_Map !== "undefined" && Scene_Map.prototype) {
        const originalMapStart = Scene_Map.prototype.start;
        Scene_Map.prototype.start = function() {
            originalMapStart.apply(this, arguments);
            setLeaderEmail();
        };
    }

    PluginManager.registerCommand(pluginName, "Login", function() {
        runBlockingCommand(this, function() {
            openLoginDialog("", false);
        });
    });

    PluginManager.registerCommand(pluginName, "ShowProfile", function() {
        runBlockingCommand(this, showProfile);
    });

    PluginManager.registerCommand(pluginName, "RefreshWallet", function() {
        runBlockingCommand(this, showProfile);
    });

    PluginManager.registerCommand(pluginName, "Logout", function() {
        runBlockingCommand(this, performLogout);
    });

    PluginManager.registerCommand(pluginName, "CheckIntegrationStatus", function() {
        runBlockingCommand(this, checkIntegrationStatus);
    });

    PluginManager.registerCommand(pluginName, "StartRun", function() {
        runBlockingCommand(this, function() {
            return startRunFlow();
        });
    });

    PluginManager.registerCommand(pluginName, "CompleteRun", function() {
        runBlockingCommand(this, completeRun);
    });

    PluginManager.registerCommand(pluginName, "RetryComplete", function() {
        runBlockingCommand(this, retryComplete);
    });

    PluginManager.registerCommand(pluginName, "ShowLeaderboard", function(args) {
        const commandArgs = args || {};
        runBlockingCommand(this, function() {
            showLeaderboard(commandArgs.limit, commandArgs.offset);
        });
    });

    if (typeof Window_TitleCommand !== "undefined" &&
        typeof Scene_Title !== "undefined") {
        const originalMakeTitleCommandList = Window_TitleCommand.prototype.makeCommandList;
        Window_TitleCommand.prototype.makeCommandList = function() {
            originalMakeTitleCommandList.apply(this, arguments);
            this.addCommand("LEADERBOARD", "p2rLeaderboard", true);
        };

        const originalCreateTitleCommandWindow = Scene_Title.prototype.createCommandWindow;
        Scene_Title.prototype.createCommandWindow = function() {
            if (typeof Moghunter !== "undefined" && Array.isArray(Moghunter.title_com_pos)) {
                Moghunter.title_com_pos[0] = "52,440";
                Moghunter.title_com_pos[1] = "236,440";
                Moghunter.title_com_pos[2] = "420,440";
                Moghunter.title_com_pos[3] = "604,440";
            }
            originalCreateTitleCommandWindow.apply(this, arguments);
            this._commandWindow.setHandler("p2rLeaderboard", function() {
                showLeaderboard(10, 0, true);
            });
        };
    }

    if (typeof TpictureCom !== "undefined" && TpictureCom.prototype) {
        const originalPrepareTitlePicBitmap = TpictureCom.prototype.prepareBitmap;
        TpictureCom.prototype.prepareBitmap = function() {
            originalPrepareTitlePicBitmap.apply(this, arguments);
            const command = this._data &&
                this._data._list &&
                this._data._list[this._index];
            if (!command || command.symbol !== "p2rLeaderboard") {
                return;
            }
            const bitmap = new Bitmap(160, 80);
            if (typeof $gameSystem !== "undefined" && $gameSystem) {
                bitmap.fontFace = $gameSystem.mainFontFace();
            }
            bitmap.outlineColor = "rgba(0, 0, 0, 0.9)";
            bitmap.outlineWidth = 5;
            bitmap.textColor = "#ffffff";
            for (let frame = 0; frame < 2; frame++) {
                bitmap.fontSize = frame === 0 ? 22 : 20;
                bitmap.drawText("LEADERBOARD", 0, frame * 40, 160, 40, "center");
            }
            this.bitmap = bitmap;
        };
    }

    if (typeof Window_MenuCommand !== "undefined" &&
        typeof Scene_Menu !== "undefined") {
        const originalAddMenuCommands = Window_MenuCommand.prototype.addOriginalCommands;
        Window_MenuCommand.prototype.addOriginalCommands = function() {
            originalAddMenuCommands.apply(this, arguments);
            this.addCommand("Leaderboard P2R", "p2rLeaderboard", true);
            this.addCommand("Cek Koneksi P2R", "p2rStatus", true);
        };

        const originalCreateMenuCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function() {
            originalCreateMenuCommandWindow.apply(this, arguments);
            this._commandWindow.setHandler("p2rLeaderboard", function() {
                showLeaderboard(10, 0, true);
            });
            this._commandWindow.setHandler("p2rStatus", function() {
                checkIntegrationStatus(true);
            });
        };
    }
})();
