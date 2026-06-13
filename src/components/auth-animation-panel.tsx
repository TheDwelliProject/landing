/**
 * Right-rail brand panel for the auth flow. Direct port of `BrandPanel` from
 * the design source (auth-atoms.jsx) — orange field, white keyhole plate at
 * 46% from the top, four sonar rings radiating from the keyhole, three
 * drifting white-tile accents, and a serif caption pinned to the bottom-left.
 *
 * Hidden below `lg` (1024px) — below that each column would drop under ~500px
 * and the 460px sonar rings would clip asymmetrically, so phones and narrow
 * tablets get the form full-bleed instead.
 */
export function AuthAnimationPanel() {
	return (
		<aside
			aria-hidden="true"
			className="hidden lg:flex relative flex-1 min-w-0 flex-col justify-end overflow-hidden bg-orange text-white p-12"
		>
			{/* Sonar rings — centred on the keyhole (top 46%, left 50%). */}
			<div className="ac-bp-rings">
				<span className="ac-bp-ring" />
				<span className="ac-bp-ring" />
				<span className="ac-bp-ring" />
				<span className="ac-bp-ring" />
			</div>

			{/* Drifting brand tiles. */}
			<span className="ac-bp-tile ac-bp-tile1" />
			<span className="ac-bp-tile ac-bp-tile2" />
			<span className="ac-bp-tile ac-bp-tile3" />

			{/* Keyhole mark — white rounded-squircle plate with the orange
			    keyhole rotating slowly inside it. */}
			<div className="ac-bp-mark">
				<svg
					width="124"
					height="124"
					viewBox="0 0 100 100"
					className="block"
				>
					<path
						d="M 26 6 H 74 A 20 20 0 0 1 94 26 V 74 A 20 20 0 0 1 74 94 H 26 A 20 20 0 0 1 6 74 V 26 A 20 20 0 0 1 26 6 Z"
						fill="#fff"
					/>
					<circle
						className="ac-bp-hole"
						cx="50"
						cy="46"
						r="9"
						fill="#FF5703"
					/>
					<rect
						className="ac-bp-hole"
						x="44.15"
						y="46"
						width="11.7"
						height="25.2"
						rx="5.85"
						fill="#FF5703"
					/>
				</svg>
			</div>

			{/* Caption pinned to the bottom-left via the parent's
			    justify-content: flex-end. */}
			<p className="relative m-0 max-w-[380px] font-serif italic text-[33px] leading-[1.12] tracking-[-0.01em] text-white">
				One home for rent, repairs, and everyone who lives there.
			</p>
		</aside>
	);
}
