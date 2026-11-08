# houly-pipe

A local render pipeline (FFmpeg + green-screen keyer) and a small, authenticated
HTTP bridge that lets the Intégrav phone app drive it from your desk — or from
anywhere, through a tunnel.

Everything here is standard-library Python plus FFmpeg. No `pip install`.

## Quick start (phone on the same Wi-Fi)

```sh
python3 scripts/bridge.py            # pair + serve on port 8787
```

It prints a LAN address and a six-digit code. On the phone:
**Render Studio → Connect a computer**, type the address and the code.
The code lives 10 minutes, pairs one phone, and survives 5 wrong guesses
before the window shuts. Press `P` in the terminal for a fresh code,
`L` to list paired devices, `Ctrl-C` to stop.

```sh
python3 scripts/bridge.py --port 8788         # another port
python3 scripts/bridge.py --bind 127.0.0.1    # loopback only — nothing else can reach it
python3 scripts/bridge.py --list-devices
python3 scripts/bridge.py --revoke all        # forget every paired phone
python3 scripts/bridge.py --tunnel            # you are sharing it past your network
```

## Testing the app in the cloud preview

The Rork preview simulator runs in the cloud, **not** on your Wi-Fi, so it
cannot reach `192.168.x.x`. Share the bridge through an https tunnel instead:

```sh
# cloudflared (free, no account for quick tunnels)
cloudflared tunnel --url http://localhost:8787
#   → prints https://<something>.trycloudflare.com

# or ngrok
ngrok http 8787
#   → prints https://<something>.ngrok-free.app
```

Run the bridge with `--tunnel` so it warns you about what that means, then in
the app type the tunnel URL (including `https://`) and the pairing code.
When you are done, press `P` — a code that travelled the internet should never
stay redeemable.

**The iOS app requires https for any address outside your local network**
(App Transport Security). Plain `http://` only works against LAN IPs and
`.local` names. Tunnels give you https for free; your LAN address does not
need it because it never leaves the house.

## Security model

* Nothing answers without a bearer token, and tokens are only issued in
  exchange for the pairing code printed in **your** terminal.
* The code is single-use, 10-minute TTL, locked after 5 wrong guesses.
* Only the SHA-256 of each token is written to disk (`.bridge/state.json`,
  mode `0600`); a stolen state file cannot be replayed.
* Downloads are confined to the pipeline output folder; key-preview inputs to
  the pipeline folder. Traversal attempts are refused and logged.
* Revoking a device (phone-side unlink, `--revoke`, or `DELETE /v1/devices/<id>`)
  kills its token instantly. There is deliberately **no** token auto-expiry:
  a paired computer stays paired until you unlink it — expiry would just nag
  you into re-pairing without making anything safer.
* Every request is logged to the terminal with timestamp, IP, path and status.

## Route tests

```sh
cd scripts && python3 -m unittest test_bridge -v
```

Covers discovery, pairing lockout and single-use rules, token enforcement on
every protected route, cancel, revoke, and both path-confinement guards.
Full renders are exercised by hand (they need ffmpeg and real footage).
