/* weather (and curl, as in `curl wttr.in`) — always sunny. */
Portfolio.command({
  name: 'weather',
  hidden: true,
  desc: 'forecast',
  aliases: ['curl'],
  run(args, t) {
    t.print(`<span class="pre"><span class="warn">    \\   /    </span> ${t.esc(t.cv.location)}
<span class="warn">     .-.     </span> Sunny with a chance of commits
<span class="warn">  ― (   ) ―  </span> +23 °C (feels like a productive day)
<span class="warn">     \`-'     </span> ↗ 5 km/h of fresh ideas
<span class="warn">    /   \\    </span> 0.0 mm of bugs</span>`);
  }
});
