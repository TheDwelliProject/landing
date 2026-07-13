/**
 * Presentational step indicator for the community-creation wizard. No state —
 * the container (community-wizard.tsx) owns `current` and persistence.
 */
export function WizardStepper({
	steps,
	current,
}: {
	steps: readonly string[];
	current: number;
}) {
	return (
		<ol className="flex items-center gap-6">
			{steps.map((step, index) => {
				const done = index < current;
				const active = index === current;
				return (
					<li
						key={step}
						aria-current={active ? "step" : undefined}
						className="flex items-center gap-2"
					>
						<span
							className={`w-1.5 h-1.5 rounded-full ${
								done || active ? "bg-orange" : "bg-charcoal/20"
							}`}
						/>
						<span
							className={`font-mono uppercase tracking-[0.16em] text-[11px] ${
								active
									? "text-orange"
									: done
										? "text-charcoal/60"
										: "text-charcoal/35"
							}`}
						>
							{step}
						</span>
					</li>
				);
			})}
		</ol>
	);
}
