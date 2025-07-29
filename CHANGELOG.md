## [70.1.2](https://github.com/elastic/elastic-charts/compare/v70.1.1...v70.1.2) (2025-07-23)


### Bug Fixes

* **axis:** disable nice adaptive ticks ([#2689](https://github.com/elastic/elastic-charts/issues/2689)) ([5f9d946](https://github.com/elastic/elastic-charts/commit/5f9d9463ee35ac16ab469778e6a4f493c9ca344f))

## [70.1.1](https://github.com/elastic/elastic-charts/compare/v70.1.0...v70.1.1) (2025-07-14)


### Bug Fixes

* **axis:** prevent sticky label in multi-layer time axis ([#2681](https://github.com/elastic/elastic-charts/issues/2681)) ([089c835](https://github.com/elastic/elastic-charts/commit/089c835cf4b77bc837445c5c048cdd74e56f4c27))
* **highlight:** improve highlight on area/line charts  ([#2676](https://github.com/elastic/elastic-charts/issues/2676)) ([556a21b](https://github.com/elastic/elastic-charts/commit/556a21b2c1616d6ab734f706b1fd1c6493fc874b))
* **isolatedPoints:** fix visibility and remove custom style for isolated points ([#2665](https://github.com/elastic/elastic-charts/issues/2665)) ([b38059d](https://github.com/elastic/elastic-charts/commit/b38059d16cb162c596d5104f3310f6ec27763e57))

# [70.1.0](https://github.com/elastic/elastic-charts/compare/v70.0.1...v70.1.0) (2025-06-23)


### Bug Fixes

* **flame_chart:** fix font size to occupy available space ([#2671](https://github.com/elastic/elastic-charts/issues/2671)) ([2b5d962](https://github.com/elastic/elastic-charts/commit/2b5d962d891cd5257ff3a4f0064ec1b77290c454))
* **heatmap:** update tooltip visibility logic to handle empty tooltip info ([#2661](https://github.com/elastic/elastic-charts/issues/2661)) ([ff5ff27](https://github.com/elastic/elastic-charts/commit/ff5ff27a968cc87c0717aa070cfec0b8b6af8977))


### Features

* **interactions:** add modifier keys pressed information available in the `onElementClick` and `onBrushEnd` listeners ([#2647](https://github.com/elastic/elastic-charts/issues/2647)) ([d632df0](https://github.com/elastic/elastic-charts/commit/d632df093e06d0f870aa60bdccfdb1d925933d52))

## [70.0.1](https://github.com/elastic/elastic-charts/compare/v70.0.0...v70.0.1) (2025-05-02)


### Bug Fixes

* **colors:** use borealis colors as default ([#2643](https://github.com/elastic/elastic-charts/issues/2643)) ([b728661](https://github.com/elastic/elastic-charts/commit/b7286613b2b1f6a001751f6a24c3e71b0f235ab8))
* Update aria-labelledby for Sparkline svg to not use spaces ([#2654](https://github.com/elastic/elastic-charts/issues/2654)) ([19349f3](https://github.com/elastic/elastic-charts/commit/19349f3a9507bf92d23e013c4e3ddf31f8c80bf7))

# [70.0.0](https://github.com/elastic/elastic-charts/compare/v69.2.0...v70.0.0) (2025-03-26)


### Features

* **xy:** change timeAxisLayerCount the default from 0 to 2 ([#2582](https://github.com/elastic/elastic-charts/issues/2582)) ([81c32c7](https://github.com/elastic/elastic-charts/commit/81c32c703cb29ab6c5a8b06708c270e65558a4c6))


### BREAKING CHANGES

* **xy:** The timeAxisLayerCount options now defaults to 2 instead of 0. The multilayer time axis is now the default style.

# [69.2.0](https://github.com/elastic/elastic-charts/compare/v69.1.1...v69.2.0) (2025-03-26)


### Features

* **metric:** Expose both font size and color stylings on the extra prop ([#2627](https://github.com/elastic/elastic-charts/issues/2627)) ([2d21118](https://github.com/elastic/elastic-charts/commit/2d2111899588d6619dbe4152fd8113cd2215fa1a))

## [69.1.1](https://github.com/elastic/elastic-charts/compare/v69.1.0...v69.1.1) (2025-03-07)


### Bug Fixes

* **axis:** remove multi-pass axis line rendering ([#2606](https://github.com/elastic/elastic-charts/issues/2606)) ([d33007c](https://github.com/elastic/elastic-charts/commit/d33007c53e5699e91a529b05b5fe92759cf678fc))
* **deps:** update dependency @elastic/eui to ^99.2.0 ([#2611](https://github.com/elastic/elastic-charts/issues/2611)) ([bbb803e](https://github.com/elastic/elastic-charts/commit/bbb803e6d39c67106a97bf8d2f9a633fabe4326f))
* **typescript:** increase and fix compilation target and lib  ([#2622](https://github.com/elastic/elastic-charts/issues/2622)) ([fa80875](https://github.com/elastic/elastic-charts/commit/fa80875c263addb4590a02115d52d62366a9a5eb))

# [69.1.0](https://github.com/elastic/elastic-charts/compare/v69.0.0...v69.1.0) (2025-01-29)


### Bug Fixes

* **deps:** update dependency json-schema-to-typescript to v15.0.4 ([#2522](https://github.com/elastic/elastic-charts/issues/2522)) ([2d4b650](https://github.com/elastic/elastic-charts/commit/2d4b6505db822b1c9f6e7779978375630f96e2aa))
* **heatmap:** respect margins and paddings ([#2577](https://github.com/elastic/elastic-charts/issues/2577)) ([c24566d](https://github.com/elastic/elastic-charts/commit/c24566d491d472caa0298a440d681e48fbf54992))
* **themes:** reintroduce Amsterdam colors ([#2604](https://github.com/elastic/elastic-charts/issues/2604)) ([8c9913d](https://github.com/elastic/elastic-charts/commit/8c9913d2ec6b6594e0e6a89e03f047c45a894b22))


### Features

* **heatmap:** add rotation in heatmap debug state ([#2594](https://github.com/elastic/elastic-charts/issues/2594)) ([9047bd2](https://github.com/elastic/elastic-charts/commit/9047bd25583161eb80a58f45dd1f278e763acabb))

# [69.0.0](https://github.com/elastic/elastic-charts/compare/v68.1.0...v69.0.0) (2025-01-28)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v99 ([#2567](https://github.com/elastic/elastic-charts/issues/2567)) ([f397987](https://github.com/elastic/elastic-charts/commit/f3979877ae3ec86a36ab494c7601fcc559a000a0))
* **style:** align xy axis style to borealis ([#2584](https://github.com/elastic/elastic-charts/issues/2584)) ([9486374](https://github.com/elastic/elastic-charts/commit/9486374376c676550d185be008cecb9804a60bb9))


### Styles

* **theme:** cleanup remaining theme changes ([#2602](https://github.com/elastic/elastic-charts/issues/2602)) ([beb4cf1](https://github.com/elastic/elastic-charts/commit/beb4cf108abbd6451bd252b5a33d87cae1d6aaef)), closes [#2601](https://github.com/elastic/elastic-charts/issues/2601)


### BREAKING CHANGES

* **theme:** the light and dark themes follow the EUI Borealis theme.

# [68.1.0](https://github.com/elastic/elastic-charts/compare/v68.0.4...v68.1.0) (2025-01-13)


### Features

* remove error boundary in favor of external boundary ([#2580](https://github.com/elastic/elastic-charts/issues/2580)) ([b84f9bf](https://github.com/elastic/elastic-charts/commit/b84f9bf3d7a2e28d36ea68879c9d0d8090ac98c9))

## [68.0.4](https://github.com/elastic/elastic-charts/compare/v68.0.3...v68.0.4) (2024-12-11)


### Bug Fixes

* **xy:** compute per series and global minPointsDistance ([#2571](https://github.com/elastic/elastic-charts/issues/2571)) ([8dae2c1](https://github.com/elastic/elastic-charts/commit/8dae2c1f4c99146aa757b2d3eec9d72846248cc7))


### Performance Improvements

* fix unnecessary re-render ([#2573](https://github.com/elastic/elastic-charts/issues/2573)) ([feacfd6](https://github.com/elastic/elastic-charts/commit/feacfd6247b9580a8d32bc5d6284329b2035c1ba))

## [68.0.3](https://github.com/elastic/elastic-charts/compare/v68.0.2...v68.0.3) (2024-11-28)


### Bug Fixes

* **xy:** line annotation marker aria label fix ([#2558](https://github.com/elastic/elastic-charts/issues/2558)) ([3b056c3](https://github.com/elastic/elastic-charts/commit/3b056c395c5ff87044ea989a3b737022cea20509))

## [68.0.2](https://github.com/elastic/elastic-charts/compare/v68.0.1...v68.0.2) (2024-10-24)


### Bug Fixes

* **xy:** single point visibility ([#2557](https://github.com/elastic/elastic-charts/issues/2557)) ([e16c902](https://github.com/elastic/elastic-charts/commit/e16c902dd5c73ae130a0b472f88e7d5fda5b9e0f))

## [68.0.1](https://github.com/elastic/elastic-charts/compare/v68.0.0...v68.0.1) (2024-10-23)


### Bug Fixes

* **deps:** update dependency @playwright/test to ^1.47.2 ([#2539](https://github.com/elastic/elastic-charts/issues/2539)) ([10d5f40](https://github.com/elastic/elastic-charts/commit/10d5f40f992df92d2ab7a7083e28232ccf26c572))
* **Metric:** improve default font-sizing ([#2548](https://github.com/elastic/elastic-charts/issues/2548)) ([2e1178d](https://github.com/elastic/elastic-charts/commit/2e1178da38b93ef57011440bb75d260290ddd06e))

# [68.0.0](https://github.com/elastic/elastic-charts/compare/v67.0.1...v68.0.0) (2024-10-08)


### Features

* **xy:** render sorting ([#2524](https://github.com/elastic/elastic-charts/issues/2524)) ([c514571](https://github.com/elastic/elastic-charts/commit/c5145713025cfa3d48cb526d2fcad884a036d393))


### BREAKING CHANGES

* **xy:** The way mixed stacked/nonstacked series are colored now is different from the previous behaviour. Now we color them not by their insert index but by the way we display them in the rendering: from the left to right, bottom top, stacked, nonstacked. This align correctly also the legend colors by default. This does **not** affect colors assigned via a `SeriesColorAccessor`.

## [67.0.1](https://github.com/elastic/elastic-charts/compare/v67.0.0...v67.0.1) (2024-10-03)


### Bug Fixes

* **ChartStatus:** render complete if same parent size is dispatched ([#2534](https://github.com/elastic/elastic-charts/issues/2534)) ([c3aba88](https://github.com/elastic/elastic-charts/commit/c3aba885b92f898ef59f452d3fed7812584d48b0))

# [67.0.0](https://github.com/elastic/elastic-charts/compare/v66.1.1...v67.0.0) (2024-09-23)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^95.8.0 ([#2504](https://github.com/elastic/elastic-charts/issues/2504)) ([1ca5dd9](https://github.com/elastic/elastic-charts/commit/1ca5dd90a4cf3c9174ae780cfb6c78c042059d65))
* **deps:** update dependency @playwright/test to ^1.46.1 ([#2511](https://github.com/elastic/elastic-charts/issues/2511)) ([b99b3e6](https://github.com/elastic/elastic-charts/commit/b99b3e600c094c512b0464f2cf5348ec1a4a2ef7))
* **deps:** update dependency json-schema-to-typescript to v15.0.1 ([#2510](https://github.com/elastic/elastic-charts/issues/2510)) ([a606d72](https://github.com/elastic/elastic-charts/commit/a606d7293f82f2ceafae62ad461d46f61392c3da))


### Styles

* **theme:** change point and isolated point style and visibility ([#2525](https://github.com/elastic/elastic-charts/issues/2525)) ([87de6c2](https://github.com/elastic/elastic-charts/commit/87de6c295909cb84c87130957d27b26bbfbd02b9))


### BREAKING CHANGES

* **theme:** the `isolatedPoint` style doesn't contain the `radius` parameter anymore. The radius is derived from the `line.strokeWidth` parameter.

## [66.1.1](https://github.com/elastic/elastic-charts/compare/v66.1.0...v66.1.1) (2024-08-09)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^95.5.0 ([#2496](https://github.com/elastic/elastic-charts/issues/2496)) ([803a56a](https://github.com/elastic/elastic-charts/commit/803a56aa9361b3bfaf3356fa5151f201667031e8))
* **deps:** update dependency @playwright/test to ^1.45.3 ([#2495](https://github.com/elastic/elastic-charts/issues/2495)) ([4b82ee2](https://github.com/elastic/elastic-charts/commit/4b82ee222daad53b3aa95c4444f5a52cd4d22892))
* **deps:** update dependency json-schema-to-typescript to v15 ([#2497](https://github.com/elastic/elastic-charts/issues/2497)) ([d635ebb](https://github.com/elastic/elastic-charts/commit/d635ebb3e350a636c293ac821f8f8423cb92533b))
* **flame:** failure when accessing `visualViewport.visualViewport` from within `iFrame` ([#2502](https://github.com/elastic/elastic-charts/issues/2502)) ([84f5328](https://github.com/elastic/elastic-charts/commit/84f53281782c78d1f85a0e0dd7f1a0aa4952d7a3))

# [66.1.0](https://github.com/elastic/elastic-charts/compare/v66.0.5...v66.1.0) (2024-07-15)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^95.3.0 ([#2479](https://github.com/elastic/elastic-charts/issues/2479)) ([d8c8a6a](https://github.com/elastic/elastic-charts/commit/d8c8a6a555752b38bb5596c6a90db01616a08ff2))
* **deps:** update dependency @playwright/test to ^1.45.0 ([#2480](https://github.com/elastic/elastic-charts/issues/2480)) ([6b9935c](https://github.com/elastic/elastic-charts/commit/6b9935c127e8c2c7d16358a955b8c2e2ab222353))
* **deps:** update dependency @playwright/test to ^1.45.1 ([#2485](https://github.com/elastic/elastic-charts/issues/2485)) ([8fe29f5](https://github.com/elastic/elastic-charts/commit/8fe29f5e1909933779f02fa7f669d44a4b77943b))
* **deps:** update dependency json-schema-to-typescript to v14.1.0 ([#2481](https://github.com/elastic/elastic-charts/issues/2481)) ([b459a76](https://github.com/elastic/elastic-charts/commit/b459a760fd87f06edb54afcf78bad9761ffb2eac))
* **metric:** icon alignment defaults ([#2489](https://github.com/elastic/elastic-charts/issues/2489)) ([bba76fa](https://github.com/elastic/elastic-charts/commit/bba76fa652db3cc8b2fbf884bdede913ddce1b71))


### Features

* **metric:** make value fit logic uniform across panels ([#2484](https://github.com/elastic/elastic-charts/issues/2484)) ([991347d](https://github.com/elastic/elastic-charts/commit/991347d91e2dd80bf68fe044688050eeae6d8680))

## [66.0.5](https://github.com/elastic/elastic-charts/compare/v66.0.4...v66.0.5) (2024-07-01)


### Bug Fixes

* (Legend values) percentage formatter should be distict from tick formatter ([#2474](https://github.com/elastic/elastic-charts/issues/2474)) ([b5bd998](https://github.com/elastic/elastic-charts/commit/b5bd998f23ffa4a9032442728dae8fbcf49604eb))

## [66.0.4](https://github.com/elastic/elastic-charts/compare/v66.0.3...v66.0.4) (2024-06-24)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v95 ([#2462](https://github.com/elastic/elastic-charts/issues/2462)) ([040c354](https://github.com/elastic/elastic-charts/commit/040c354d349127697c0ac1a60f4cb103db600535))
* option to disable the isolated point styles on line and area charts ([#2472](https://github.com/elastic/elastic-charts/issues/2472)) ([ae16815](https://github.com/elastic/elastic-charts/commit/ae1681516ac43fd6b9aca851635483c9ed6e9512))
* outside rect annotation placement and group relations ([#2471](https://github.com/elastic/elastic-charts/issues/2471)) ([d46fb41](https://github.com/elastic/elastic-charts/commit/d46fb410ac1459ca7d943620ab830ce1924d76ab))

## [66.0.3](https://github.com/elastic/elastic-charts/compare/v66.0.2...v66.0.3) (2024-06-18)


### Bug Fixes

* correct median copy in legend values ([#2467](https://github.com/elastic/elastic-charts/issues/2467)) ([0476a64](https://github.com/elastic/elastic-charts/commit/0476a644592d0f6e7abe4a4fde5392a76c67ee9a))

## [66.0.2](https://github.com/elastic/elastic-charts/compare/v66.0.0...v66.0.1) (2024-06-12)


### Bug Fixes

* point style accessor for isolated points ([#2464](https://github.com/elastic/elastic-charts/issues/2464)) ([ee7f529](https://github.com/elastic/elastic-charts/commit/ee7f5299ea1088f447a3139ed6aceed54386a562))

## 66.0.1 (2024-06-12)

Failed publish to npm, re-published as `66.0.2`

# [66.0.0](https://github.com/elastic/elastic-charts/compare/v65.2.0...v66.0.0) (2024-06-10)


### Features

* **Metric:** style enhancements ([#2437](https://github.com/elastic/elastic-charts/issues/2437)) ([0686596](https://github.com/elastic/elastic-charts/commit/0686596b44fd9cac00955478179597c5b4bd9d91))


### Performance Improvements

* replace spread with concat where useful ([#2446](https://github.com/elastic/elastic-charts/issues/2446)) ([078b490](https://github.com/elastic/elastic-charts/commit/078b4905131fcf368a25bcadcb53e414d634daea))


### BREAKING CHANGES

* **Metric:** The `MetricStyle.text.darkColor` and `MetricStyle.text.lightColor` are now `MetricStyle.textDarkColor` and `MetricStyle.textLightColor`, respectively. This PR also includes minor overall style changes to the text breakpoints of the `Metric` chart.

# [65.2.0](https://github.com/elastic/elastic-charts/compare/v65.1.0...v65.2.0) (2024-06-04)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^94.5.2 ([#2450](https://github.com/elastic/elastic-charts/issues/2450)) ([26b425c](https://github.com/elastic/elastic-charts/commit/26b425cb6962f1edf82e2e4032d7bf4d5cdb21a8))
* **deps:** update dependency @elastic/eui to ^94.6.0 ([#2454](https://github.com/elastic/elastic-charts/issues/2454)) ([6759469](https://github.com/elastic/elastic-charts/commit/67594696135f0300fc771cdc919c0c2638e887cd))
* **deps:** update dependency @playwright/test to ^1.44.1 ([#2451](https://github.com/elastic/elastic-charts/issues/2451)) ([158b4c2](https://github.com/elastic/elastic-charts/commit/158b4c20ab590eea3d2c5e0f1096294f364ae6e6))
* **deps:** update dependency json-schema-to-typescript to v14.0.5 ([#2452](https://github.com/elastic/elastic-charts/issues/2452)) ([7947e17](https://github.com/elastic/elastic-charts/commit/7947e172bb460c42659da5d0d88f8eec1a408c2b))
* **metric:** chart not rendered when the trend is empty ([#2447](https://github.com/elastic/elastic-charts/issues/2447)) ([6042cc8](https://github.com/elastic/elastic-charts/commit/6042cc8bac220a0d2e3939bccb8ab026adb2b7c8))
* **sunburst:** rendering for full sections ([#2457](https://github.com/elastic/elastic-charts/issues/2457)) ([58c2721](https://github.com/elastic/elastic-charts/commit/58c27211066e60150184392c41197a8c6184a8a0))


### Features

* **legend:** improve tooltip wording ([#2439](https://github.com/elastic/elastic-charts/issues/2439)) ([27c04f4](https://github.com/elastic/elastic-charts/commit/27c04f49600cc88c237c1e50a7ec77f797f0bb40))

# [65.1.0](https://github.com/elastic/elastic-charts/compare/v65.0.0...v65.1.0) (2024-05-28)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^94.5.0 ([#2433](https://github.com/elastic/elastic-charts/issues/2433)) ([b13ded9](https://github.com/elastic/elastic-charts/commit/b13ded98da16780f8c0b3c08a02ac5bdd532d709))
* **deps:** update dependency @playwright/test to ^1.44.0 ([#2434](https://github.com/elastic/elastic-charts/issues/2434)) ([faf36aa](https://github.com/elastic/elastic-charts/commit/faf36aaf1e1527c105da614907ca853198d0c1cf))
* **Metric:** should only show one focus halo on `::focus` event ([#2441](https://github.com/elastic/elastic-charts/issues/2441)) ([96b0779](https://github.com/elastic/elastic-charts/commit/96b0779cc3c9a7bd31b55286a140488bbf82ef5f))
* react component type errors ([#2440](https://github.com/elastic/elastic-charts/issues/2440)) ([f0b3a00](https://github.com/elastic/elastic-charts/commit/f0b3a008e76da2f9edd366fc7e56a2749291338c))


### Features

* **legend:** add legend stats (table view) ([#2426](https://github.com/elastic/elastic-charts/issues/2426)) ([c22f767](https://github.com/elastic/elastic-charts/commit/c22f7673c89f516fde9e1d56d77873de6b36600d))

# [65.0.0](https://github.com/elastic/elastic-charts/compare/v64.1.0...v65.0.0) (2024-05-20)


### Bug Fixes

* **barSeries:** error rendering bars with negative log scale ([#2407](https://github.com/elastic/elastic-charts/issues/2407)) ([4ab6d8f](https://github.com/elastic/elastic-charts/commit/4ab6d8f39c7ca8f895724f6df6c17373fa975896))
* **deps:** update dependency @elastic/eui to ^93.5.1 ([#2375](https://github.com/elastic/elastic-charts/issues/2375)) ([35ed956](https://github.com/elastic/elastic-charts/commit/35ed956265225337a3102cea7d388601705fc883))
* **deps:** update dependency @elastic/eui to ^93.5.2 ([#2386](https://github.com/elastic/elastic-charts/issues/2386)) ([e26c6dd](https://github.com/elastic/elastic-charts/commit/e26c6ddccf871b859c056b11e6ed483a1cea6cf2))
* **deps:** update dependency @elastic/eui to ^93.6.0 ([#2393](https://github.com/elastic/elastic-charts/issues/2393)) ([40f2b7b](https://github.com/elastic/elastic-charts/commit/40f2b7b00b8dedbe6765bc8db3aa71d43cf64685))
* **deps:** update dependency @elastic/eui to ^94.3.0 ([#2424](https://github.com/elastic/elastic-charts/issues/2424)) ([cff5181](https://github.com/elastic/elastic-charts/commit/cff5181a1d2a67307768ede1dceecfc439861687))
* **deps:** update dependency @elastic/eui to v94 ([#2409](https://github.com/elastic/elastic-charts/issues/2409)) ([67c814f](https://github.com/elastic/elastic-charts/commit/67c814f02f310df3850680e3f859f286885ab1cb))
* **deps:** update dependency @playwright/test to ^1.43.0 ([#2388](https://github.com/elastic/elastic-charts/issues/2388)) ([42f86d7](https://github.com/elastic/elastic-charts/commit/42f86d727b3ff245b25d9e707b9cfc1df12dc0df))
* **deps:** update dependency @playwright/test to ^1.43.1 ([#2413](https://github.com/elastic/elastic-charts/issues/2413)) ([79b1c7f](https://github.com/elastic/elastic-charts/commit/79b1c7f4137c53cb3ebaa9c8a3ba23e3ff7b5b6c))
* **deps:** update dependency json-schema-to-typescript to v14 ([#2414](https://github.com/elastic/elastic-charts/issues/2414)) ([785f635](https://github.com/elastic/elastic-charts/commit/785f6351737e1df6798d93200584646d49b83bae))
* **deps:** update dependency json-schema-to-typescript to v14.0.4 ([#2421](https://github.com/elastic/elastic-charts/issues/2421)) ([790170a](https://github.com/elastic/elastic-charts/commit/790170a5ab764f5d2f63de92d634962bbaed7317))
* **legend:** custom legend covered by background ([#2366](https://github.com/elastic/elastic-charts/issues/2366)) ([5b9ffac](https://github.com/elastic/elastic-charts/commit/5b9ffac3e32b22360cd0245ae58aa0efe048afec))


### Features

* add support for start day of week on MLT axis ([#2362](https://github.com/elastic/elastic-charts/issues/2362)) ([3aac1f0](https://github.com/elastic/elastic-charts/commit/3aac1f03ec2079324fa4def0c1d24b027f2555e9))
* **Legend:** change click on item behaviour ([#2427](https://github.com/elastic/elastic-charts/issues/2427)) ([b1c72df](https://github.com/elastic/elastic-charts/commit/b1c72df8698e15230f5f55c38f1a94d337e51c04))
* **legend:** change click on item behaviour ([#2431](https://github.com/elastic/elastic-charts/issues/2431)) ([b03bdd0](https://github.com/elastic/elastic-charts/commit/b03bdd0e702aed1c069be4c7230cd6634307a4c5))
* **legend:** Improve interactions legend labels ([#2418](https://github.com/elastic/elastic-charts/issues/2418)) ([384baac](https://github.com/elastic/elastic-charts/commit/384baace93f0f542d55f3d145006f7a51eb873b0))
* **legend:** select legend statistic value ([#2355](https://github.com/elastic/elastic-charts/issues/2355)) ([a602838](https://github.com/elastic/elastic-charts/commit/a602838462721b6de3643da8263beab46508ac0d))
* **metric:** support array of values ([#2428](https://github.com/elastic/elastic-charts/issues/2428)) ([e448bd7](https://github.com/elastic/elastic-charts/commit/e448bd7acf0247865ecf7e1f1e14cadd1d580bef))


### Reverts

* **legend:** change click on item behaviour ([#2429](https://github.com/elastic/elastic-charts/issues/2429)) ([cc438a1](https://github.com/elastic/elastic-charts/commit/cc438a1b1b360e9892717c0f7207677078afb167)), closes [#2427](https://github.com/elastic/elastic-charts/issues/2427)


### BREAKING CHANGES

* **legend:** The legend modifier key has been changed to CTRL (or CMD on Mac) from SHIFT. The SHIFT key will no longer have any effect on click.

# [64.1.0](https://github.com/elastic/elastic-charts/compare/v64.0.2...v64.1.0) (2024-03-13)


### Features

* **theme:** move annotation default styles to `Theme` ([#2357](https://github.com/elastic/elastic-charts/issues/2357)) ([fe19ae2](https://github.com/elastic/elastic-charts/commit/fe19ae2cec3077ee34765d9be560935dd094a4ad))

## [64.0.2](https://github.com/elastic/elastic-charts/compare/v64.0.1...v64.0.2) (2024-03-12)


### Bug Fixes

* **bullet:** full circle overlapping tick labels ([#2350](https://github.com/elastic/elastic-charts/issues/2350)) ([edbff68](https://github.com/elastic/elastic-charts/commit/edbff681737ba319b455c81604e5ffff02b89f17))
* **deps:** update dependency @elastic/eui to ^93.3.0 ([#2356](https://github.com/elastic/elastic-charts/issues/2356)) ([cf9ce81](https://github.com/elastic/elastic-charts/commit/cf9ce81c08b8d0ae93fce48504d2de3539d045d0))
* **deps:** update dependency @playwright/test to ^1.42.1 ([#2354](https://github.com/elastic/elastic-charts/issues/2354)) ([03581bc](https://github.com/elastic/elastic-charts/commit/03581bc44fae02309af9fbfa42c297f7414ec156))

## [64.0.1](https://github.com/elastic/elastic-charts/compare/v64.0.0...v64.0.1) (2024-03-10)


### Bug Fixes

* **bullet:** add a11y summary and debugState ([#2352](https://github.com/elastic/elastic-charts/issues/2352)) ([49a1b35](https://github.com/elastic/elastic-charts/commit/49a1b358b21fbda4e15a96ce984d460786396899))
* **deps:** update dependency @elastic/eui to ^93.2.0 ([#2343](https://github.com/elastic/elastic-charts/issues/2343)) ([0701985](https://github.com/elastic/elastic-charts/commit/0701985a470ed98936439ccf4e21bb1d52df5e18))

# [64.0.0](https://github.com/elastic/elastic-charts/compare/v63.1.0...v64.0.0) (2024-02-13)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^93.1.0 ([#2332](https://github.com/elastic/elastic-charts/issues/2332)) ([855e357](https://github.com/elastic/elastic-charts/commit/855e357ab4433c7fc5a0e7e2c2398150ff686e41))
* **deps:** update dependency @elastic/eui to v93 ([#2324](https://github.com/elastic/elastic-charts/issues/2324)) ([ce19379](https://github.com/elastic/elastic-charts/commit/ce1937910211f812b7a4eed371337e6498b1e6b3))
* **deps:** update dependency @playwright/test to ^1.41.2 ([#2330](https://github.com/elastic/elastic-charts/issues/2330)) ([1f8c638](https://github.com/elastic/elastic-charts/commit/1f8c638356edebab8fc14d9ebdcaceec3e10812e))
* **metric:** move `MetricSpec.body` to `MetricBase` ([#2336](https://github.com/elastic/elastic-charts/issues/2336)) ([3390e25](https://github.com/elastic/elastic-charts/commit/3390e251d3edc37ca68e13ff3acd8843b3b5a6ba))
* use passed size in pixel without waiting for resizeObserver ([#2270](https://github.com/elastic/elastic-charts/issues/2270)) ([f9c11fc](https://github.com/elastic/elastic-charts/commit/f9c11fca2a284e4ca3744a02dc743d09b78f64b8))


### chore

* **bullet:** bullet improvements, bug fixes and renaming ([#2319](https://github.com/elastic/elastic-charts/issues/2319)) ([34fd38b](https://github.com/elastic/elastic-charts/commit/34fd38b77cdd060057a38e25c6197de6807839d2))


### BREAKING CHANGES

* **metric:** Moves `MetricSpec.body` to `MetricDatum.body`/`MetricBase.body`
* **bullet:** Rename `BulletGraph` to `Bullet` and `ColorBandSimpleConfig.classes` to `steps`

# [63.1.0](https://github.com/elastic/elastic-charts/compare/v63.0.0...v63.1.0) (2024-01-29)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^92.1.1 ([#2315](https://github.com/elastic/elastic-charts/issues/2315)) ([f4e4fae](https://github.com/elastic/elastic-charts/commit/f4e4fae42e5dcc1b882f0c5126c66d3c96cd2fcc))
* **deps:** update dependency @playwright/test to ^1.41.1 ([#2316](https://github.com/elastic/elastic-charts/issues/2316)) ([e2ab527](https://github.com/elastic/elastic-charts/commit/e2ab52791baef9da628930d3e8d738ce3772c34a))
* **styles:** isolated point style overrides ([#2278](https://github.com/elastic/elastic-charts/issues/2278)) ([3fb1df2](https://github.com/elastic/elastic-charts/commit/3fb1df21d08c441c84705bd3d5984fc07caa11be))


### Features

* **metric:** custom slot to render contents in gap ([#2303](https://github.com/elastic/elastic-charts/issues/2303)) ([3256c8c](https://github.com/elastic/elastic-charts/commit/3256c8ca14d180e4d7a483811a37612aca2691ce))


### Performance Improvements

* **tooltip:** improve placement logic ([#2310](https://github.com/elastic/elastic-charts/issues/2310)) ([cac5f49](https://github.com/elastic/elastic-charts/commit/cac5f4908a54374d114d7a11e66d648979013039))

# [63.0.0](https://github.com/elastic/elastic-charts/compare/v62.0.0...v63.0.0) (2024-01-24)


### Features

* **legend:** expose extra raw values ([#2308](https://github.com/elastic/elastic-charts/issues/2308)) ([85bfe06](https://github.com/elastic/elastic-charts/commit/85bfe0668d66fd24e78f2bba8be4570fa926e94c))


### BREAKING CHANGES

* **legend:** The `CustomLegend.item` now exposes both the `raw` and the `formatted` version of the extra value.

# [62.0.0](https://github.com/elastic/elastic-charts/compare/v61.2.0...v62.0.0) (2024-01-23)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^91.3.1 ([#2286](https://github.com/elastic/elastic-charts/issues/2286)) ([d4d7b5d](https://github.com/elastic/elastic-charts/commit/d4d7b5db6681ec0c65ef8b7e576f1b5fc8b5433a))
* **deps:** update dependency @elastic/eui to v92 ([#2290](https://github.com/elastic/elastic-charts/issues/2290)) ([cc537fa](https://github.com/elastic/elastic-charts/commit/cc537faf43d88acc9abab7e0dac9360bd460b574))
* **legend:** improve last value handling ([#2115](https://github.com/elastic/elastic-charts/issues/2115)) ([9f99447](https://github.com/elastic/elastic-charts/commit/9f9944734c4a13bfe9e4ffc9f4c0f39da5f9931f))


### BREAKING CHANGES

* **legend:** In cartesian charts, the default legend value now represents the data points that coincide with the latest datum in the X domain. Please consider passing every data point, even the empty ones (like empty buckets/bins/etc) if your x data domain doesn't fully cover a custom x domain passed to the chart configuration.

# [61.2.0](https://github.com/elastic/elastic-charts/compare/v61.1.0...v61.2.0) (2023-12-19)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^91.1.0 ([#2267](https://github.com/elastic/elastic-charts/issues/2267)) ([308e974](https://github.com/elastic/elastic-charts/commit/308e97429c6d69fc3b902ed557c322c1d2e6bfa8))
* **deps:** update dependency @elastic/eui to ^91.2.0 ([#2268](https://github.com/elastic/elastic-charts/issues/2268)) ([29cdcb3](https://github.com/elastic/elastic-charts/commit/29cdcb360740a535710f1a4d08a1dd44c5cb569b))
* **metric:** background colors and sparkline rendering ([#2255](https://github.com/elastic/elastic-charts/issues/2255)) ([5abddfc](https://github.com/elastic/elastic-charts/commit/5abddfc67fe284d1a483deb4f8f6bc51e7cfedbc))
* **partition:** rendering with small radius ([#2273](https://github.com/elastic/elastic-charts/issues/2273)) ([95a8537](https://github.com/elastic/elastic-charts/commit/95a8537248eff8e72db21f960852b20ccd64fa62))
* **partition:** zero value sectors cause max stack call ([#2260](https://github.com/elastic/elastic-charts/issues/2260)) ([4b30db7](https://github.com/elastic/elastic-charts/commit/4b30db72981af3baed78ad72c7ab679324a767f6))
* **theme:** legacy margins ([#2262](https://github.com/elastic/elastic-charts/issues/2262)) ([299c869](https://github.com/elastic/elastic-charts/commit/299c869fec254c16fea169cc32b319c2bc79ee71))


### Features

* increase tooltip width to 500px and truncate items to 2 lines ([#2261](https://github.com/elastic/elastic-charts/issues/2261)) ([afdef1c](https://github.com/elastic/elastic-charts/commit/afdef1c0142d954dd72a5833d6b9f0abce064f4a))

# [61.1.0](https://github.com/elastic/elastic-charts/compare/v61.0.0...v61.1.0) (2023-11-20)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v91 ([#2233](https://github.com/elastic/elastic-charts/issues/2233)) ([e89f623](https://github.com/elastic/elastic-charts/commit/e89f623792312c4f6b609ebb975de0800f3c297e))
* **metric:** add option to set empty cell background color ([#2247](https://github.com/elastic/elastic-charts/issues/2247)) ([6a9fb86](https://github.com/elastic/elastic-charts/commit/6a9fb86bee5212a47060c5070f260961097014b4))
* **metric:** background color for bar with interactions ([#2248](https://github.com/elastic/elastic-charts/issues/2248)) ([dcb56fa](https://github.com/elastic/elastic-charts/commit/dcb56fa08540631a9b3b0e588352ee6daf3d54a0))


### Features

* **bullet:** improve header layout and positioning ([#2243](https://github.com/elastic/elastic-charts/issues/2243)) ([b3a95d2](https://github.com/elastic/elastic-charts/commit/b3a95d24fb02690ca6599622352c743c04624690))
* **bullet:** new design style and implementation ([#2156](https://github.com/elastic/elastic-charts/issues/2156)) ([fca6cdd](https://github.com/elastic/elastic-charts/commit/fca6cdd5bc34a65c0792dbab7d756404bf43501b))

# [61.0.0](https://github.com/elastic/elastic-charts/compare/v60.0.0...v61.0.0) (2023-11-08)


### Bug Fixes

* `onRenderChange` callback trigger on resize ([#2228](https://github.com/elastic/elastic-charts/issues/2228)) ([be30c1b](https://github.com/elastic/elastic-charts/commit/be30c1bd48ce3e50b8e9fa28c0d8999b6366b305))
* **axis:** always render `tickLine` unless `visible` is `false` ([#2194](https://github.com/elastic/elastic-charts/issues/2194)) ([ec95d50](https://github.com/elastic/elastic-charts/commit/ec95d50180d86fb7cec8c90d952f894ac9548b4f))
* **BarSeries:** ignore histogram mode in determining stacked series ([#2225](https://github.com/elastic/elastic-charts/issues/2225)) ([27b4281](https://github.com/elastic/elastic-charts/commit/27b4281581d6d5613c3bac55b308c49c519e7160))
* clamp brushing min of last bucket ([#2227](https://github.com/elastic/elastic-charts/issues/2227)) ([155c22d](https://github.com/elastic/elastic-charts/commit/155c22dee1f891cbb630d3d99fae005d89bf76d8))
* **deps:** update dependency @elastic/eui to ^88.5.0 ([#2179](https://github.com/elastic/elastic-charts/issues/2179)) ([2bb921e](https://github.com/elastic/elastic-charts/commit/2bb921e42bf790ce091178fc66794265a2832c0e))
* **deps:** update dependency @elastic/eui to ^88.5.4 ([#2190](https://github.com/elastic/elastic-charts/issues/2190)) ([05b33e5](https://github.com/elastic/elastic-charts/commit/05b33e58f27da3685bc8a2668435e83fb260a033))
* **deps:** update dependency @elastic/eui to ^89.1.0 ([#2212](https://github.com/elastic/elastic-charts/issues/2212)) ([a91f68d](https://github.com/elastic/elastic-charts/commit/a91f68d6b7c19da43a02e2b6d205ddc7f758243b))
* **deps:** update dependency @elastic/eui to v89 ([#2193](https://github.com/elastic/elastic-charts/issues/2193)) ([132327d](https://github.com/elastic/elastic-charts/commit/132327d980f4941d81a6df5e9e76cdf065f7d744))
* **deps:** update dependency @elastic/eui to v90 ([#2222](https://github.com/elastic/elastic-charts/issues/2222)) ([10cd53b](https://github.com/elastic/elastic-charts/commit/10cd53b2e6b4f65096837a994aff69626dc4050e))


### chore

* reclaim charts theme ownership from eui ([#2175](https://github.com/elastic/elastic-charts/issues/2175)) ([422c7d5](https://github.com/elastic/elastic-charts/commit/422c7d529e2b2a1bf01d6f78c1e35a2f9c79c91f))


### Features

* **metric:** allow alpha colors and improve contrast logic  ([#2184](https://github.com/elastic/elastic-charts/issues/2184)) ([dd5732e](https://github.com/elastic/elastic-charts/commit/dd5732e83b4a23143f6fa8ceb82066150dc9fe8d))


### BREAKING CHANGES

* **BarSeries:** now ignores histogram mode in determining stacked series
* elastic charts theme renamed to `LEGACY_DARK_THEME` and `LEGACY_LIGHT_THEME` in favor of the main `DARK_THEME` and `LIGHT_THEME` which was merged with eui theme overrides. These new themes are now default.
* **axis:** Now respects `tickLine.padding` whenever `tickLine.visible` is `true`

# [60.0.0](https://github.com/elastic/elastic-charts/compare/v59.1.0...v60.0.0) (2023-09-20)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^88.2.0 ([#2161](https://github.com/elastic/elastic-charts/issues/2161)) ([6609a19](https://github.com/elastic/elastic-charts/commit/6609a19231ef8503a7cd467b1fca23c4528d6a32))
* **deps:** update dependency @elastic/eui to ^88.3.0 ([#2163](https://github.com/elastic/elastic-charts/issues/2163)) ([624f43a](https://github.com/elastic/elastic-charts/commit/624f43a0f8cffffc6622bd9c3f65a3f43af40b08))
* **deps:** update dependency @elastic/eui to v85 ([#2113](https://github.com/elastic/elastic-charts/issues/2113)) ([1b3fa7c](https://github.com/elastic/elastic-charts/commit/1b3fa7c34a96d38117cef6e1214757795b57dcd3))
* **deps:** update dependency @elastic/eui to v87 ([#2145](https://github.com/elastic/elastic-charts/issues/2145)) ([312c32c](https://github.com/elastic/elastic-charts/commit/312c32cb71cb13ce0b92c86e77c3a975e426fd2b))
* **deps:** update dependency @elastic/eui to v88 ([#2154](https://github.com/elastic/elastic-charts/issues/2154)) ([4070da0](https://github.com/elastic/elastic-charts/commit/4070da0c1f152009cd3a62abf314f6cb9f711845))
* **tooltip:** rendering in react v18 ([#2169](https://github.com/elastic/elastic-charts/issues/2169)) ([f30df54](https://github.com/elastic/elastic-charts/commit/f30df5444f0a1938b27c08acf6a15f4fc748d4ea))
* update font family ([#2165](https://github.com/elastic/elastic-charts/issues/2165)) ([be07b0c](https://github.com/elastic/elastic-charts/commit/be07b0c2164fc0a8784eb2550ad7495ed585bcdf))
* **waffle:** remove alpha artifacts ([#2139](https://github.com/elastic/elastic-charts/issues/2139)) ([8eb4ede](https://github.com/elastic/elastic-charts/commit/8eb4edecf87e9eabfeb01b1138533c5d20dcab2a))
* Wait a tick before reporting render status ([#2131](https://github.com/elastic/elastic-charts/issues/2131)) ([fd2bca4](https://github.com/elastic/elastic-charts/commit/fd2bca4ee25f7a99eafc4e2af3c312dc9183e49b))
* **xy:** disable legend extra on ordinal ([#2114](https://github.com/elastic/elastic-charts/issues/2114)) ([3ddfb18](https://github.com/elastic/elastic-charts/commit/3ddfb1816b82522e16d23b5c5230772eb5d3bd69))


### Features

* add locale prop to Settings ([#2164](https://github.com/elastic/elastic-charts/issues/2164)) ([0bb3ab1](https://github.com/elastic/elastic-charts/commit/0bb3ab1f3afc0a04c7e1af2418c6fa0a3bdd1af4))


### BREAKING CHANGES

* **xy:** when using the `ScaleType.Ordinal` for the X scale the legend extra value, representing the last and current hovered value, will not be shown.

# [59.1.0](https://github.com/elastic/elastic-charts/compare/v59.0.0...v59.1.0) (2023-07-19)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v83 ([#2088](https://github.com/elastic/elastic-charts/issues/2088)) ([c72695e](https://github.com/elastic/elastic-charts/commit/c72695e80c5dcb4a810fa9f0f3e3e29da61eb868))
* **deps:** update dependency @elastic/eui to v84 ([#2108](https://github.com/elastic/elastic-charts/issues/2108)) ([2b76a9a](https://github.com/elastic/elastic-charts/commit/2b76a9ae888df84cf57646217d1af5d8339d9e71))


### Features

* **metric:** add value icon and color ([#2101](https://github.com/elastic/elastic-charts/issues/2101)) ([d7134f5](https://github.com/elastic/elastic-charts/commit/d7134f5a458d2fb1611794ae0754156cd866fb4e))

# [59.0.0](https://github.com/elastic/elastic-charts/compare/v58.2.1...v59.0.0) (2023-06-27)


### Bug Fixes

* **legend:** use reading direction sorting for stacked bar charts ([#2080](https://github.com/elastic/elastic-charts/issues/2080)) ([be9c839](https://github.com/elastic/elastic-charts/commit/be9c83906ab58ac6193fdc9219951741d284447b))


### BREAKING CHANGES

* **legend:** the sorting order of the legend is now inverted for stacked charts, following the reading direction of the legend (top-to-bottom in insertion order)

## [58.2.1](https://github.com/elastic/elastic-charts/compare/v58.2.0...v58.2.1) (2023-06-23)


### Bug Fixes

* remove unused redux dev tools ([#2079](https://github.com/elastic/elastic-charts/issues/2079)) ([1870303](https://github.com/elastic/elastic-charts/commit/18703038807b784c347348bd8e88b9f5ae47f67e))

# [58.2.0](https://github.com/elastic/elastic-charts/compare/v58.1.0...v58.2.0) (2023-06-23)


### Bug Fixes

* `Chart` component `children` type ([#2071](https://github.com/elastic/elastic-charts/issues/2071)) ([525c782](https://github.com/elastic/elastic-charts/commit/525c782829a37e465b03d5aae7a0d697f00bd431))
* **deps:** update dependency @elastic/eui to v82 ([#2074](https://github.com/elastic/elastic-charts/issues/2074)) ([69a655f](https://github.com/elastic/elastic-charts/commit/69a655f0dac2975ab42b48a48cc19693eaff1021))


### Features

* **flame:** expose search field text and search text change listener ([#2068](https://github.com/elastic/elastic-charts/issues/2068)) ([c339947](https://github.com/elastic/elastic-charts/commit/c339947c3963b8ad8124203435f410b34b93cc1e))
* support native chart title and description ([#2002](https://github.com/elastic/elastic-charts/issues/2002)) ([341a990](https://github.com/elastic/elastic-charts/commit/341a990c5d1154f36927a91321e4d0c39b44a4be))

# [58.1.0](https://github.com/elastic/elastic-charts/compare/v58.0.0...v58.1.0) (2023-06-08)


### Features

* **flame:** expose search control ([#2064](https://github.com/elastic/elastic-charts/issues/2064)) ([011b56b](https://github.com/elastic/elastic-charts/commit/011b56b3f51e2aa1fea8410b4f24e69403635933))

# [58.0.0](https://github.com/elastic/elastic-charts/compare/v57.0.1...v58.0.0) (2023-06-06)


### Bug Fixes

* **axis:** reduce number of y axis ticks on linear scale ([#2005](https://github.com/elastic/elastic-charts/issues/2005)) ([0ef828b](https://github.com/elastic/elastic-charts/commit/0ef828b535f69d3a47fa38febd5dd1f5b88a6ce8))
* **deps:** update dependency @elastic/eui to v81 ([#2052](https://github.com/elastic/elastic-charts/issues/2052)) ([4c55e01](https://github.com/elastic/elastic-charts/commit/4c55e0119e6d0def4340a620899b7ee0e0012b02))


### BREAKING CHANGES

* **axis:** the default number of desired ticks in the Y-Axis was changed from `10` to `5`

## [57.0.1](https://github.com/elastic/elastic-charts/compare/v57.0.0...v57.0.1) (2023-05-23)


### Bug Fixes

* **axes:** start of week label on multilayer time axis ([#2035](https://github.com/elastic/elastic-charts/issues/2035)) ([9711233](https://github.com/elastic/elastic-charts/commit/9711233cbffb39e3c879e7a13502ef895e4838ee))
* **deps:** update dependency @elastic/eui to ^77.2.0 ([#2032](https://github.com/elastic/elastic-charts/issues/2032)) ([93cadcb](https://github.com/elastic/elastic-charts/commit/93cadcb7ae0aaa01ba485ee6a6f63de594a76576))
* **deps:** update dependency @elastic/eui to v78 ([#2038](https://github.com/elastic/elastic-charts/issues/2038)) ([3feff2c](https://github.com/elastic/elastic-charts/commit/3feff2c5bc3db746494a7fa417a96aa50aaaaf13))
* **deps:** update dependency @elastic/eui to v79 ([#2042](https://github.com/elastic/elastic-charts/issues/2042)) ([8015830](https://github.com/elastic/elastic-charts/commit/8015830f2086793b474ade9dfa1122d68ba169da))
* **deps:** update dependency @elastic/eui to v80 ([#2047](https://github.com/elastic/elastic-charts/issues/2047)) ([e6042f3](https://github.com/elastic/elastic-charts/commit/e6042f3da33b4e7400c6dbc5ae5e1522413a16a3))
* **heatmap:** brushing selection values ([#2028](https://github.com/elastic/elastic-charts/issues/2028)) ([6a877b4](https://github.com/elastic/elastic-charts/commit/6a877b431e68458dcf78bd7ce92c692ed5ad53af))
* **heatmap:** wrong axes labels on hover ([#2033](https://github.com/elastic/elastic-charts/issues/2033)) ([045fb03](https://github.com/elastic/elastic-charts/commit/045fb037a97db7fcad0c3d0af2b31f7a4260149d))

# [57.0.0](https://github.com/elastic/elastic-charts/compare/v56.0.0...v57.0.0) (2023-04-19)


### Code Refactoring

* enable `noUncheckedIndexedAccess` ([#2006](https://github.com/elastic/elastic-charts/issues/2006)) ([f446cca](https://github.com/elastic/elastic-charts/commit/f446cca1691bbe5d7608845b65ea555f74e0f6af))


### BREAKING CHANGES

* Enables stricter type option in src and could have
unexpected changes. This release is meant to serve as a clean break
in case any issues arise.

# [56.0.0](https://github.com/elastic/elastic-charts/compare/v55.0.0...v56.0.0) (2023-04-18)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^76.4.0 ([#2008](https://github.com/elastic/elastic-charts/issues/2008)) ([95176e1](https://github.com/elastic/elastic-charts/commit/95176e14294b36fce983f53c6c5f278da24f50b1))
* **deps:** update dependency @elastic/eui to v77 ([#2018](https://github.com/elastic/elastic-charts/issues/2018)) ([c079730](https://github.com/elastic/elastic-charts/commit/c079730dd849c34f71608df36938560566ba19d3))
* **interactions:** brushing over origin coordinates ([#2013](https://github.com/elastic/elastic-charts/issues/2013)) ([937feb0](https://github.com/elastic/elastic-charts/commit/937feb0fcf1a11c473e45dfb0da36443660e98be))
* **tooltip:** custom tooltip header context ([#1989](https://github.com/elastic/elastic-charts/issues/1989)) ([1e5b861](https://github.com/elastic/elastic-charts/commit/1e5b86106ff4c72e5a59b074e0472023ecc68164))


### Features

* **metric:** trend with string value ([#2011](https://github.com/elastic/elastic-charts/issues/2011)) ([91d7695](https://github.com/elastic/elastic-charts/commit/91d76957d88d25e93904f73b845c47d411f4ce32))


### BREAKING CHANGES

* **tooltip:** The `header` property of `TooltipInfo` type was simplified to `PointerValue` as to include only relevant properties. This change is propagated to all other types using `header` as a `TooltipValue`. The `TooltipInfo.values` used to conditionally pass only highlighted `TooltipValue`s when using a `customTooltip` and now _always_ passes all `values`.

# [55.0.0](https://github.com/elastic/elastic-charts/compare/v54.0.0...v55.0.0) (2023-03-21)


### Bug Fixes

* **docs:** lint and fix EUI breaking changes ([0d14194](https://github.com/elastic/elastic-charts/commit/0d1419475f9f1a4ae5d83fdf247f35178e261d27))


### Features

* **heatmap:** small multiples ([#1933](https://github.com/elastic/elastic-charts/issues/1933)) ([690f568](https://github.com/elastic/elastic-charts/commit/690f5686c3de0da6714d649bc492a6c68e47b47f))

# [54.0.0](https://github.com/elastic/elastic-charts/compare/v53.1.1...v54.0.0) (2023-03-09)


### Bug Fixes

* **annotation:** render annotations correctly based on passed handlers ([#1971](https://github.com/elastic/elastic-charts/issues/1971)) ([4bdedff](https://github.com/elastic/elastic-charts/commit/4bdedff5a9ed4f2b39cff5d97a57d6b92383f14d))
* **deps:** update dependency @elastic/eui to v75 ([#1964](https://github.com/elastic/elastic-charts/issues/1964)) ([cf886f5](https://github.com/elastic/elastic-charts/commit/cf886f5278a53b68ee7f4eb38d984ad82292d0b5))
* **deps:** update dependency @elastic/eui to v76 ([#1987](https://github.com/elastic/elastic-charts/issues/1987)) ([89dc8a1](https://github.com/elastic/elastic-charts/commit/89dc8a1cd9eaa47f14977b0fcb5b82aa51502cc4))
* **flamegraph:** show tooltip prompt only if pinnable ([#1967](https://github.com/elastic/elastic-charts/issues/1967)) ([1a13d80](https://github.com/elastic/elastic-charts/commit/1a13d80af7522ab60f3b94b4c1b927a9569deb69))
* **heatmap:** Expose axis title as debug data ([#1970](https://github.com/elastic/elastic-charts/issues/1970)) ([0a998a5](https://github.com/elastic/elastic-charts/commit/0a998a55fb11c6f8768db95397374bb7e61b014b))
* **partition:** allow custom sorting for the legend items ([#1959](https://github.com/elastic/elastic-charts/issues/1959)) ([1afa2c4](https://github.com/elastic/elastic-charts/commit/1afa2c401fe7e0a85c239add03760a4511884472))
* **partition:** render legend items with zero values  ([#1956](https://github.com/elastic/elastic-charts/issues/1956)) ([a85d1ae](https://github.com/elastic/elastic-charts/commit/a85d1ae4c000b526898967528fd372b03a8f8e88))
* **xy:** respect `integersOnly` prop on axis component ([#1958](https://github.com/elastic/elastic-charts/issues/1958)) ([93f5497](https://github.com/elastic/elastic-charts/commit/93f549728edc3e781aaea08c50e7d4bec0d34b11))


### BREAKING CHANGES

* **partition:** The `Layer.fillColor` function now accepts the following signature: `(key: Key, sortIndex: number, node: ArrayNode, tree: HierarchyOfArrays) => string;` This exposes a similar set of information but allows us more control over the internals to define/generate the legend. The legend for pie/donut/mosaic/treemap charts is sorted in a hierarchical way even if the legend is flat.
The default highlight strategy used to highlight partition elements when hovering over the legend item has been changed to `LegendStrategy.Path`.

## [53.1.1](https://github.com/elastic/elastic-charts/compare/v53.1.0...v53.1.1) (2023-02-10)


### Bug Fixes

* **partition:** tooltip item series identifier ([#1957](https://github.com/elastic/elastic-charts/issues/1957)) ([06d8b5d](https://github.com/elastic/elastic-charts/commit/06d8b5dc0cbca3aaafb202c6415904c2de00c8a7))

# [53.1.0](https://github.com/elastic/elastic-charts/compare/v53.0.0...v53.1.0) (2023-02-02)


### Features

* **metric:** new set of size breakpoints ([#1951](https://github.com/elastic/elastic-charts/issues/1951)) ([fc6a32b](https://github.com/elastic/elastic-charts/commit/fc6a32b47f29af93e8ae6e1e1676cddbc8f9e020))

# [53.0.0](https://github.com/elastic/elastic-charts/compare/v52.0.0...v53.0.0) (2023-02-01)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v74 ([#1950](https://github.com/elastic/elastic-charts/issues/1950)) ([a030ca9](https://github.com/elastic/elastic-charts/commit/a030ca9cc7cf5f5025c23744c667d60bed096584))


### Features

* **tooltip:** expose tooltip container ([#1915](https://github.com/elastic/elastic-charts/issues/1915)) ([40ba99b](https://github.com/elastic/elastic-charts/commit/40ba99b54d6802874ab9ae5ba1da42ff9d6e9fbf))


### BREAKING CHANGES

* **tooltip:** You must wrap your `customTooltip` components with a `TooltipContainer` if you are using our `Tooltip` components.

# [52.0.0](https://github.com/elastic/elastic-charts/compare/v51.3.0...v52.0.0) (2023-01-27)


### Bug Fixes

* annotation details tooltip throwing with hooks ([#1949](https://github.com/elastic/elastic-charts/issues/1949)) ([779b7f3](https://github.com/elastic/elastic-charts/commit/779b7f3499f34fb4471ee5f1fac390a7499fe6ee))
* **deps:** update dependency @elastic/eui to v72 ([#1914](https://github.com/elastic/elastic-charts/issues/1914)) ([8814c80](https://github.com/elastic/elastic-charts/commit/8814c80f71ff6cbd39187064abda131077f3ca68))
* **deps:** update dependency @elastic/eui to v73 ([#1941](https://github.com/elastic/elastic-charts/issues/1941)) ([4eeafa7](https://github.com/elastic/elastic-charts/commit/4eeafa7864f756685ae23ced54dd34f9fede330a))


### BREAKING CHANGES

* The `customTooltipDetails` type is now passing `details` as `props` using a `ComponentType`.

# [51.3.0](https://github.com/elastic/elastic-charts/compare/v51.2.0...v51.3.0) (2022-12-23)


### Bug Fixes

* **axis:** don't account for label overflow with multi-layer time axis ([#1906](https://github.com/elastic/elastic-charts/issues/1906)) ([5d2ac4b](https://github.com/elastic/elastic-charts/commit/5d2ac4b6591e25278738655fd7f6bfe86dfc7537))


### Features

* **tooltip:** animate context menu prompt ([#1887](https://github.com/elastic/elastic-charts/issues/1887)) ([9b7cca7](https://github.com/elastic/elastic-charts/commit/9b7cca78b476547ce08cb90d5b0468e21e3f74d1))

# [51.2.0](https://github.com/elastic/elastic-charts/compare/v51.1.1...v51.2.0) (2022-12-19)


### Bug Fixes

* **axis:** truncate titles longer then the available space ([#1905](https://github.com/elastic/elastic-charts/issues/1905)) ([3526a69](https://github.com/elastic/elastic-charts/commit/3526a698ae9bce9363ded7251e7301586f2e57c5))
* **deps:** update dependency @elastic/eui to ^70.4.0 ([#1893](https://github.com/elastic/elastic-charts/issues/1893)) ([6576041](https://github.com/elastic/elastic-charts/commit/65760410124d8fe63b3711b4f94272add98e2cf4))
* **deps:** update dependency @elastic/eui to v71 ([#1898](https://github.com/elastic/elastic-charts/issues/1898)) ([da596a5](https://github.com/elastic/elastic-charts/commit/da596a516ec07e820eedf184d01ae279facacc0e))


### Features

* **legend:** add custom legend component ([#1889](https://github.com/elastic/elastic-charts/issues/1889)) ([2e1648d](https://github.com/elastic/elastic-charts/commit/2e1648d4c610c71acf6f4370205aa06a737d422f))

## [51.1.1](https://github.com/elastic/elastic-charts/compare/v51.1.0...v51.1.1) (2022-12-01)


### Bug Fixes

* **tooltip:** check if scroll event target is null ([#1886](https://github.com/elastic/elastic-charts/issues/1886)) ([84a45be](https://github.com/elastic/elastic-charts/commit/84a45be6fc8844b3e4b8379f88881cab08dd001e))

# [51.1.0](https://github.com/elastic/elastic-charts/compare/v51.0.0...v51.1.0) (2022-11-18)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^70.2.0 ([#1876](https://github.com/elastic/elastic-charts/issues/1876)) ([716ff48](https://github.com/elastic/elastic-charts/commit/716ff48a5ad2d2708a77f195339b87f3dfd6b34f))
* **flamegraph:** search on change ([#1885](https://github.com/elastic/elastic-charts/issues/1885)) ([80f2fe3](https://github.com/elastic/elastic-charts/commit/80f2fe3f945118c89dc516380888e7202b81e2ef))
* **heatmap:** cursor visible out of cell bounds ([#1866](https://github.com/elastic/elastic-charts/issues/1866)) ([0a814c8](https://github.com/elastic/elastic-charts/commit/0a814c855d1bb14e6df7bc6f31db9a2791c53ade))
* workaround firefox amd macbook regression webgl_gl_VertexID_Offset ([#1869](https://github.com/elastic/elastic-charts/issues/1869)) ([02181aa](https://github.com/elastic/elastic-charts/commit/02181aab1f90dbc480877c8adbae6aa70976a941))
* **xy:** cursor while dragging with no brushing ([#1883](https://github.com/elastic/elastic-charts/issues/1883)) ([f41ce98](https://github.com/elastic/elastic-charts/commit/f41ce98b27b1ea3c17e258cff1b5ddc9643081f2))


### Features

* **heatmap:** highlight selected range from legend hover  ([#1864](https://github.com/elastic/elastic-charts/issues/1864)) ([a3fbe86](https://github.com/elastic/elastic-charts/commit/a3fbe86996f61e6eb148794fa8bc694d7316b6fa))
* **theme:** expose point highlighter style ([#1881](https://github.com/elastic/elastic-charts/issues/1881)) ([3722851](https://github.com/elastic/elastic-charts/commit/37228515dd2b28b616942527f8b3c4d517f91e4d))

# [51.0.0](https://github.com/elastic/elastic-charts/compare/v50.2.0...v51.0.0) (2022-11-08)


### Features

* **tooltip:** pinned tooltip with actions ([#1782](https://github.com/elastic/elastic-charts/issues/1782)) ([7a054f7](https://github.com/elastic/elastic-charts/commit/7a054f7e13d723c1f8435cfb8513d788d5cbfb6d))


### BREAKING CHANGES

* **tooltip:** tooltip actions, interaction behavior and styles

Co-authored-by: Marco Vettorello <vettorello.marco@gmail.com>
Co-authored-by: elastic-datavis[bot] <98618603+elastic-datavis[bot]@users.noreply.github.com>

# [50.2.0](https://github.com/elastic/elastic-charts/compare/v50.1.0...v50.2.0) (2022-11-08)


### Features

* **flame:** node size and position tweening ([#1860](https://github.com/elastic/elastic-charts/issues/1860)) ([603f47e](https://github.com/elastic/elastic-charts/commit/603f47e92bdc44c0fa31693b667db594c80fad99))

# [50.1.0](https://github.com/elastic/elastic-charts/compare/v50.0.2...v50.1.0) (2022-11-03)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v70 ([#1850](https://github.com/elastic/elastic-charts/issues/1850)) ([d05994e](https://github.com/elastic/elastic-charts/commit/d05994e5c4ff02121e33b4d54d915994eca35d21))


### Features

* **partition:** show hierarchical information in the tooltip ([#1843](https://github.com/elastic/elastic-charts/issues/1843)) ([136b7ae](https://github.com/elastic/elastic-charts/commit/136b7ae5825a24bff483a700111af19d600de960))
* **xy:** quarterly time and zoom pan numerical raster as well as other improvs ([#1856](https://github.com/elastic/elastic-charts/issues/1856)) ([75d826a](https://github.com/elastic/elastic-charts/commit/75d826ac1b444888a95188279c82055856d533f1))

## [50.0.2](https://github.com/elastic/elastic-charts/compare/v50.0.1...v50.0.2) (2022-10-11)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v68 ([#1836](https://github.com/elastic/elastic-charts/issues/1836)) ([086a09d](https://github.com/elastic/elastic-charts/commit/086a09d88aa24f560c2d578ac9e9719e2ac05b23))
* **deps:** update dependency @elastic/eui to v69 ([#1841](https://github.com/elastic/elastic-charts/issues/1841)) ([575aa3a](https://github.com/elastic/elastic-charts/commit/575aa3a1d992639e2b6fdab06d80ae016836c726))
* **tooltip:** heatmap visible tooltip option ([#1842](https://github.com/elastic/elastic-charts/issues/1842)) ([db3de18](https://github.com/elastic/elastic-charts/commit/db3de182382247735fd11a3938d9235c0fa395ff))

## [50.0.1](https://github.com/elastic/elastic-charts/compare/v50.0.0...v50.0.1) (2022-09-28)


### Bug Fixes

* **flamegraph:** dark theme ([#1830](https://github.com/elastic/elastic-charts/issues/1830)) ([c997f54](https://github.com/elastic/elastic-charts/commit/c997f54af4e23ce3e4a338c0d389969217aebee0))
* **style:** import the legacy reset css ([#1828](https://github.com/elastic/elastic-charts/issues/1828)) ([e59bc22](https://github.com/elastic/elastic-charts/commit/e59bc2262506e9a4866914f83e40625e3c85c94f))

# [50.0.0](https://github.com/elastic/elastic-charts/compare/v49.0.0...v50.0.0) (2022-09-21)


### chore

* **xy:** timeslip typescript and timezone verification ([#1826](https://github.com/elastic/elastic-charts/issues/1826)) ([1ee26a5](https://github.com/elastic/elastic-charts/commit/1ee26a5ab85178e07308cddb8fd14bbff38df7f1))


### BREAKING CHANGES

* **xy:** non-IANA timezones such as `"utc-3"` are no longer accepted. Use a standard IANA location code or test with a relative one such as `"Etc/GMT+3"`

* chore: timeslip typescript and other typing improvements
* test: more tightly ensure correct time zone for xy charts
* refactor: timeslip extraction of small functions to remove some large functions

# [49.0.0](https://github.com/elastic/elastic-charts/compare/v48.0.1...v49.0.0) (2022-09-17)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v67 ([#1815](https://github.com/elastic/elastic-charts/issues/1815)) ([a45b3d3](https://github.com/elastic/elastic-charts/commit/a45b3d34c47d05c1059cfb43cf507f7b74722a4c))
* **metric:** improve multi-line wrapping ([#1816](https://github.com/elastic/elastic-charts/issues/1816)) ([f9c790e](https://github.com/elastic/elastic-charts/commit/f9c790ef2c4a8b97d278c9ee7e27f2c5081297ed))


### Features

* **metric:** add a textual value ([#1817](https://github.com/elastic/elastic-charts/issues/1817)) ([d7610ad](https://github.com/elastic/elastic-charts/commit/d7610ad548e26e34623fe97b4c3408b543be82ed))
* **metric:** add empty cell marker ([#1819](https://github.com/elastic/elastic-charts/issues/1819)) ([58ca9c3](https://github.com/elastic/elastic-charts/commit/58ca9c3b3307bbda2100b932426b8b71779583e6))
* **metric:** expose min metric height ([#1825](https://github.com/elastic/elastic-charts/issues/1825)) ([c9bd634](https://github.com/elastic/elastic-charts/commit/c9bd6344f37c90340c9e7fa7f0c4e05b5f130011))


### BREAKING CHANGES

* **metric:** the metric types have been changed: the `value: number` and `valueFormatter` are only available for a numerical, progress bar, or trend metric. For the textual metric, the `value` has a `string` type.
The `progressBarDirection` and `trendShape` properties are now required.

## [48.0.1](https://github.com/elastic/elastic-charts/compare/v48.0.0...v48.0.1) (2022-09-08)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v66 ([#1810](https://github.com/elastic/elastic-charts/issues/1810)) ([3f1db71](https://github.com/elastic/elastic-charts/commit/3f1db718ba2d957a14710aaa80faa38e633b6a4b))
* **flame:** undo the conversion to uniform buffer objects ([#1808](https://github.com/elastic/elastic-charts/issues/1808)) ([2b49347](https://github.com/elastic/elastic-charts/commit/2b493476e65f4376b9f79147eeaadfeb491bc003))

# [48.0.0](https://github.com/elastic/elastic-charts/compare/v47.2.1...v48.0.0) (2022-08-31)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v65 ([#1802](https://github.com/elastic/elastic-charts/issues/1802)) ([37a0ce7](https://github.com/elastic/elastic-charts/commit/37a0ce74067f8de5fea0704687ad0cc241a9b7a8))
* **deps:** upgrade uuid to latest version ([#1794](https://github.com/elastic/elastic-charts/issues/1794)) ([35bb737](https://github.com/elastic/elastic-charts/commit/35bb737b7c5031a8b64b68eb85720bbe3f033df6))


### Features

* **xy:** collapsing time into a single hh:mm[:ss] layer ([#1791](https://github.com/elastic/elastic-charts/issues/1791)) ([577cfee](https://github.com/elastic/elastic-charts/commit/577cfee01bb8be6e362086bde53189169ef6e430))


### BREAKING CHANGES

* **xy:** show hh:mm in a single labeled axis layer and other grid related adjustments

## [47.2.1](https://github.com/elastic/elastic-charts/compare/v47.2.0...v47.2.1) (2022-08-23)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v63 ([#1783](https://github.com/elastic/elastic-charts/issues/1783)) ([554f370](https://github.com/elastic/elastic-charts/commit/554f370ff7f780e9bed2772ed042eaed05927bd6))
* **deps:** update dependency @elastic/eui to v64 ([#1798](https://github.com/elastic/elastic-charts/issues/1798)) ([bb028e9](https://github.com/elastic/elastic-charts/commit/bb028e91f45a5354b3642253bccaba6c26baad93))
* **metric:** clip title at right length ([#1790](https://github.com/elastic/elastic-charts/issues/1790)) ([7d7ad55](https://github.com/elastic/elastic-charts/commit/7d7ad5506c5fb2c7b6596c3ab9bf255e658317ab))
* **metric:** use a correct React key for each grid item ([#1789](https://github.com/elastic/elastic-charts/issues/1789)) ([076406e](https://github.com/elastic/elastic-charts/commit/076406e954bf27ecea0cbdde7e53eed3ae59d340))

# [47.2.0](https://github.com/elastic/elastic-charts/compare/v47.1.1...v47.2.0) (2022-08-04)


### Features

* **heatmap:** sync cursor between cartesian chart and heatmap ([#1721](https://github.com/elastic/elastic-charts/issues/1721)) ([2b58e90](https://github.com/elastic/elastic-charts/commit/2b58e90ff9e6b95f2193da30e43a0a61044a2391))
* **text:** improved word wrap function ([#1761](https://github.com/elastic/elastic-charts/issues/1761)) ([eaf0d59](https://github.com/elastic/elastic-charts/commit/eaf0d59edbb185be0d6d770f59ef5720c68008bf))
* timeslip prototype added ([#1767](https://github.com/elastic/elastic-charts/issues/1767)) ([b079766](https://github.com/elastic/elastic-charts/commit/b07976604e13eae5ea566cf78584c9c9e83d82af))

## [47.1.1](https://github.com/elastic/elastic-charts/compare/v47.1.0...v47.1.1) (2022-08-01)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v62 ([#1771](https://github.com/elastic/elastic-charts/issues/1771)) ([2f9f96f](https://github.com/elastic/elastic-charts/commit/2f9f96fe709f8829162b747d2017e0a6ed66f5f5))
* **time:** render correctly 0-24 hourly clock ([#1765](https://github.com/elastic/elastic-charts/issues/1765)) ([cc2435b](https://github.com/elastic/elastic-charts/commit/cc2435b858d42c01cc3d9d2ece81e21ee72578f8))

# [47.0.0](https://github.com/elastic/elastic-charts/compare/v46.13.0...v47.0.0) (2022-07-22)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^60.3.0 ([#1755](https://github.com/elastic/elastic-charts/issues/1755)) ([623b19f](https://github.com/elastic/elastic-charts/commit/623b19fd616371b9f8b1b5a3ca474acd1e8956e5))


### Features

* **tooltip:** composable tooltips - phase 1 ([#1725](https://github.com/elastic/elastic-charts/issues/1725)) ([e79fa20](https://github.com/elastic/elastic-charts/commit/e79fa20fa8536186a404de65d23323902d0600e5))


### BREAKING CHANGES

* **tooltip:** `Settings.tooltip` is deprecated in favor of the new `Tooltip` spec. Type changes related to `TooltipProps`, `TooltipSettings` and others see #1725. Changes to tooltip styles from dark to light theme. The Annotation tooltip class `.echAnnotation` used to target the icon, but now refers to the tooltip itself similar to `.echTooltip` and now `.echAnnotation__marker` refers to the icon itself.

```diff
 const tooltipProps = {...};
 <Chart>
-  <Settings tooltip={tooltipProps} />
+  <Tooltip {...tooltipProps} />
 </Chart>
```

# [46.13.0](https://github.com/elastic/elastic-charts/compare/v46.12.1...v46.13.0) (2022-07-14)


### Features

* **utils:** expose `roundDateToESInterval` function ([#1754](https://github.com/elastic/elastic-charts/issues/1754)) ([a687211](https://github.com/elastic/elastic-charts/commit/a6872114d86d0ac540f7dfacfe6745351ab0752c))

## [46.12.1](https://github.com/elastic/elastic-charts/compare/v46.12.0...v46.12.1) (2022-07-13)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^60.2.0 ([#1747](https://github.com/elastic/elastic-charts/issues/1747)) ([e0490c0](https://github.com/elastic/elastic-charts/commit/e0490c08d6ac7e3f96b1626eac7afe5a750547ac))
* use typeof check to check for `process` variable ([#1751](https://github.com/elastic/elastic-charts/issues/1751)) ([93e4447](https://github.com/elastic/elastic-charts/commit/93e444798f6266e6c2b8987e6c74fdb876c57511))

# [46.12.0](https://github.com/elastic/elastic-charts/compare/v46.11.2...v46.12.0) (2022-07-07)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^60.1.1 ([#1739](https://github.com/elastic/elastic-charts/issues/1739)) ([a213e86](https://github.com/elastic/elastic-charts/commit/a213e862a00b1933c4a8381adbf7d40adcdd0631))
* **heatmap:** empty state only when there is no valid data ([#1726](https://github.com/elastic/elastic-charts/issues/1726)) ([9938498](https://github.com/elastic/elastic-charts/commit/993849893fca65aaeffe89c96d5dc45e3267ca23))


### Features

* **metric:** add click handling ([#1718](https://github.com/elastic/elastic-charts/issues/1718)) ([fc31956](https://github.com/elastic/elastic-charts/commit/fc31956c6b68ff9e99c22a1dbeecfd89e5ad9d0e))
* **metric:** add icon and title padding ([#1720](https://github.com/elastic/elastic-charts/issues/1720)) ([65d06ca](https://github.com/elastic/elastic-charts/commit/65d06caaf16132b6016d6302f01488d9a537069d))
* **metric:** progress bar should always start from zero ([#1737](https://github.com/elastic/elastic-charts/issues/1737)) ([bcf6566](https://github.com/elastic/elastic-charts/commit/bcf65663ef338d668c186d3a6596f143c75bc911))

## [46.11.2](https://github.com/elastic/elastic-charts/compare/v46.11.1...v46.11.2) (2022-06-28)


### Bug Fixes

* **events:** remove async callbacks from code ([#1730](https://github.com/elastic/elastic-charts/issues/1730)) ([27a7256](https://github.com/elastic/elastic-charts/commit/27a7256e04415989361858273a920d007cb19b29))

## [46.11.1](https://github.com/elastic/elastic-charts/compare/v46.11.0...v46.11.1) (2022-06-28)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v60 ([#1727](https://github.com/elastic/elastic-charts/issues/1727)) ([cb4a9df](https://github.com/elastic/elastic-charts/commit/cb4a9dff4631a954b3b890c7098ab1534c13c587))
* **example:** make events work in the composable story ([#1729](https://github.com/elastic/elastic-charts/issues/1729)) ([cd84972](https://github.com/elastic/elastic-charts/commit/cd849726915ebbd366bc92722ed9f21d9af79c03))
* **heatmap:** correctly compute vertical axis width max size ([#1723](https://github.com/elastic/elastic-charts/issues/1723)) ([aaeb4d3](https://github.com/elastic/elastic-charts/commit/aaeb4d30af7d89791fe8e3a9019fddd54fbd5eb1))

# [46.11.0](https://github.com/elastic/elastic-charts/compare/v46.10.2...v46.11.0) (2022-06-22)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^59.1.0 ([#1717](https://github.com/elastic/elastic-charts/issues/1717)) ([2d681d4](https://github.com/elastic/elastic-charts/commit/2d681d4723d7598be367b411276c578dad6c38ee))
* **heatmap:** align cell edges to the grid ([#1716](https://github.com/elastic/elastic-charts/issues/1716)) ([299054b](https://github.com/elastic/elastic-charts/commit/299054b2ae70cf245c0c840438570668415f1209))


### Features

* **flame:** additional controls ([#1722](https://github.com/elastic/elastic-charts/issues/1722)) ([966a7fa](https://github.com/elastic/elastic-charts/commit/966a7faff13f3baf931bf1cf67758a2b5e097a94))
* **flame:** navigation and controls ([#1719](https://github.com/elastic/elastic-charts/issues/1719)) ([dd39f3c](https://github.com/elastic/elastic-charts/commit/dd39f3cf3142f1cac1647a7945caee847bf8e187))
* **heatmap:** Allows callback events whenever pointer cursor moves ([#1668](https://github.com/elastic/elastic-charts/issues/1668)) ([0448b08](https://github.com/elastic/elastic-charts/commit/0448b089ac4315d487f83e74eb80e059204ff2b7))

## [46.10.2](https://github.com/elastic/elastic-charts/compare/v46.10.1...v46.10.2) (2022-06-16)


### Bug Fixes

* **deps:** update dependency d3-interpolate to v3.0.1 ([#1670](https://github.com/elastic/elastic-charts/issues/1670)) ([893e895](https://github.com/elastic/elastic-charts/commit/893e895567a47e7956d6311622c975e7d000f055))
* **heatmap:** don't render null values ([#1708](https://github.com/elastic/elastic-charts/issues/1708)) ([1c140bf](https://github.com/elastic/elastic-charts/commit/1c140bfa93001de6943d17a9dd460f2e74913342))

## [46.10.1](https://github.com/elastic/elastic-charts/compare/v46.10.0...v46.10.1) (2022-06-13)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v59 ([#1711](https://github.com/elastic/elastic-charts/issues/1711)) ([105c98f](https://github.com/elastic/elastic-charts/commit/105c98f11b981569bd0468c7750573323cdc831b))
* **flame:** no focus border ([#1709](https://github.com/elastic/elastic-charts/issues/1709)) ([fddb506](https://github.com/elastic/elastic-charts/commit/fddb506b85d88646ae48284b1200dec303e9e192))
* **time_axis:** gracefully handle zero axis size ([#1710](https://github.com/elastic/elastic-charts/issues/1710)) ([bf67c1f](https://github.com/elastic/elastic-charts/commit/bf67c1f797a840c9ed54c92b818315ebfc5d3a92))

# [46.10.0](https://github.com/elastic/elastic-charts/compare/v46.9.0...v46.10.0) (2022-06-10)


### Features

* Metric visualization ([#1658](https://github.com/elastic/elastic-charts/issues/1658)) ([fc2c955](https://github.com/elastic/elastic-charts/commit/fc2c955c1615c4d76079d01b685d7466e799c147))

# [46.9.0](https://github.com/elastic/elastic-charts/compare/v46.8.0...v46.9.0) (2022-06-07)


### Features

* **annotations:** animated fade trigger ([#1693](https://github.com/elastic/elastic-charts/issues/1693)) ([dbd91cb](https://github.com/elastic/elastic-charts/commit/dbd91cb3fccaecbb53988e5070c6c1054fc35121))

# [46.8.0](https://github.com/elastic/elastic-charts/compare/v46.7.1...v46.8.0) (2022-06-03)


### Features

* **flame:** keyboard shortcuts for the text field ([#1697](https://github.com/elastic/elastic-charts/issues/1697)) ([ee29fae](https://github.com/elastic/elastic-charts/commit/ee29fae0448772834def86f55df8fe80d4235a82))

## [46.7.1](https://github.com/elastic/elastic-charts/compare/v46.7.0...v46.7.1) (2022-06-03)


### Bug Fixes

* **bubble:** tooltip visibility on hover ([#1674](https://github.com/elastic/elastic-charts/issues/1674)) ([d3cabbe](https://github.com/elastic/elastic-charts/commit/d3cabbe59f3ce7678a5e635d713272a13baf7076))
* **deps:** update dependency @elastic/eui to ^58.1.1 ([#1689](https://github.com/elastic/elastic-charts/issues/1689)) ([c8d6eed](https://github.com/elastic/elastic-charts/commit/c8d6eeda40d288065e4caea25b6f2311e0a387d0))
* **flame:** safari and zoom regressions fixed and misc improvs ([#1695](https://github.com/elastic/elastic-charts/issues/1695)) ([9a48783](https://github.com/elastic/elastic-charts/commit/9a4878387151e663558ee922a1f40d6c9d1c4766))

# [46.7.0](https://github.com/elastic/elastic-charts/compare/v46.6.0...v46.7.0) (2022-06-01)


### Features

* pulsate node on click and search hit ([#1694](https://github.com/elastic/elastic-charts/issues/1694)) ([5068742](https://github.com/elastic/elastic-charts/commit/5068742032d376d70a405fe2c727efa2a87770f2))

# [46.6.0](https://github.com/elastic/elastic-charts/compare/v46.5.0...v46.6.0) (2022-05-31)


### Features

* **flame:** show two ancestors ([#1692](https://github.com/elastic/elastic-charts/issues/1692)) ([3ced28b](https://github.com/elastic/elastic-charts/commit/3ced28bac664cf156929416e84ce24ab20ae50a3))

# [46.5.0](https://github.com/elastic/elastic-charts/compare/v46.4.0...v46.5.0) (2022-05-26)


### Features

* **flame:** context loss handling ([#1682](https://github.com/elastic/elastic-charts/issues/1682)) ([0e32209](https://github.com/elastic/elastic-charts/commit/0e3220955661348c6cf02d4e379ddec340f0ccfc))

# [46.4.0](https://github.com/elastic/elastic-charts/compare/v46.3.0...v46.4.0) (2022-05-24)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v58 ([#1677](https://github.com/elastic/elastic-charts/issues/1677)) ([69ad62b](https://github.com/elastic/elastic-charts/commit/69ad62bf57d880f45a5250b8ccfb75da54c8f205))


### Features

* **flame:** minimap pan ([#1678](https://github.com/elastic/elastic-charts/issues/1678)) ([fc81ada](https://github.com/elastic/elastic-charts/commit/fc81ada306c042b751a523588bf0eead43881327))

# [46.3.0](https://github.com/elastic/elastic-charts/compare/v46.2.0...v46.3.0) (2022-05-19)


### Features

* **flame:** search and other utilities ([#1676](https://github.com/elastic/elastic-charts/issues/1676)) ([b8eaa1f](https://github.com/elastic/elastic-charts/commit/b8eaa1f6266e150cf7153c30c5d7a1c6e21bbac4))

# [46.2.0](https://github.com/elastic/elastic-charts/compare/v46.1.0...v46.2.0) (2022-05-18)


### Bug Fixes

* runtime error with `process.env` in src ([#1672](https://github.com/elastic/elastic-charts/issues/1672)) ([47a6b0b](https://github.com/elastic/elastic-charts/commit/47a6b0b9ab88cc33229ca8c132e10deb6729cd57))
* **deps:** update dependency @elastic/eui to v56 ([#1667](https://github.com/elastic/elastic-charts/issues/1667)) ([285ec8b](https://github.com/elastic/elastic-charts/commit/285ec8bdd05dee758f03b503cb1df311b140c778))


### Features

* flame graph with WebGL ([#1664](https://github.com/elastic/elastic-charts/issues/1664)) ([96368ea](https://github.com/elastic/elastic-charts/commit/96368ea45e093cf0e1b0b6db7356568e98be25c9))

# [46.1.0](https://github.com/elastic/elastic-charts/compare/v46.0.1...v46.1.0) (2022-05-05)


### Bug Fixes

* **animations:** flashing when using grouped parameterized keys ([#1665](https://github.com/elastic/elastic-charts/issues/1665)) ([1323edc](https://github.com/elastic/elastic-charts/commit/1323edc76f496028ffe2119ec83af2834484bede))
* **deps:** update dependency @elastic/eui to ^55.1.0 ([#1663](https://github.com/elastic/elastic-charts/issues/1663)) ([ef8a185](https://github.com/elastic/elastic-charts/commit/ef8a185fc621890d561432953846112e957bdb5d))
* **deps:** update dependency @elastic/eui to v55 ([#1659](https://github.com/elastic/elastic-charts/issues/1659)) ([5fc4af3](https://github.com/elastic/elastic-charts/commit/5fc4af3c84b1ff9d2818862d1eb19de780de4208))


### Features

* **annotations:** animated focus states for hovered annotation ([#1628](https://github.com/elastic/elastic-charts/issues/1628)) ([0bbb809](https://github.com/elastic/elastic-charts/commit/0bbb809132897dc691f1a71c676c46ec91aa59df))

## [46.0.1](https://github.com/elastic/elastic-charts/compare/v46.0.0...v46.0.1) (2022-04-19)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^54.1.0 ([#1652](https://github.com/elastic/elastic-charts/issues/1652)) ([c9c6d31](https://github.com/elastic/elastic-charts/commit/c9c6d31aca342df83271efcbaeed5a79c02a71a3))
* **rendering:** clip at panel sizes on small multiples ([#1651](https://github.com/elastic/elastic-charts/issues/1651)) ([2850530](https://github.com/elastic/elastic-charts/commit/285053061f286d6171221cb99483dd500dfaf52a))

# [46.0.0](https://github.com/elastic/elastic-charts/compare/v45.1.1...v46.0.0) (2022-04-14)


### Bug Fixes

* **axis:** ticks generation for linear scale on bar charts ([#1645](https://github.com/elastic/elastic-charts/issues/1645)) ([65d0e7d](https://github.com/elastic/elastic-charts/commit/65d0e7deeba4f6b98d13e3eeff5442aefcb85132))
* **axis:** use correct desired tick count based on axis type ([#1646](https://github.com/elastic/elastic-charts/issues/1646)) ([512a6cd](https://github.com/elastic/elastic-charts/commit/512a6cda80a6df0fc7709b4a0b1d5516df8782f2))
* **deps:** update dependency @elastic/eui to v53 ([#1639](https://github.com/elastic/elastic-charts/issues/1639)) ([34bf325](https://github.com/elastic/elastic-charts/commit/34bf3251d69e07dde3537a2bececd84905836732))
* **deps:** update dependency @elastic/eui to v54 ([#1642](https://github.com/elastic/elastic-charts/issues/1642)) ([6eaca0a](https://github.com/elastic/elastic-charts/commit/6eaca0a5052fd877aa380216a155982ca2198a2c))


### Features

* **axes:** option to fit domain to list of annotation `SpecIds` ([#1641](https://github.com/elastic/elastic-charts/issues/1641)) ([220350d](https://github.com/elastic/elastic-charts/commit/220350df862b52de364b7e96088f6c5651cb396b))
* **goal:** auto generated linear ticks ([#1637](https://github.com/elastic/elastic-charts/issues/1637)) ([5437d8e](https://github.com/elastic/elastic-charts/commit/5437d8e985ecc8cfa32651ccc97fdf7b9da84b01))
* **legend:** expose sorting function ([#1644](https://github.com/elastic/elastic-charts/issues/1644)) ([128114c](https://github.com/elastic/elastic-charts/commit/128114c57d722702faceb1d3277f5b12f3407dac))


### BREAKING CHANGES

* **goal:** goal chart now requires domain min and max to be defined

## [45.1.1](https://github.com/elastic/elastic-charts/compare/v45.1.0...v45.1.1) (2022-03-30)


### Bug Fixes

* **style:** remove unnecessary eui exports ([3b8243c](https://github.com/elastic/elastic-charts/commit/3b8243c8222fc335670cf77b2013aadf9e7dcc7a))

# [45.1.0](https://github.com/elastic/elastic-charts/compare/v45.0.1...v45.1.0) (2022-03-29)


### Bug Fixes

* **axis:** ordinal number ending fix for the weekly resolution ([#1634](https://github.com/elastic/elastic-charts/issues/1634)) ([18b4077](https://github.com/elastic/elastic-charts/commit/18b4077f4fdb0c2b38bc351809706f5112fc2690))
* **deps:** update dependency @elastic/eui to ^52.2.0 ([#1632](https://github.com/elastic/elastic-charts/issues/1632)) ([7e0be07](https://github.com/elastic/elastic-charts/commit/7e0be078f86453c32bb1109b0390bfd03ecb39b6))
* **deps:** update dependency @elastic/eui to v50 ([#1622](https://github.com/elastic/elastic-charts/issues/1622)) ([0eb7975](https://github.com/elastic/elastic-charts/commit/0eb79759621e0b1b0e7df36115fd7df9589b7ce9))
* **deps:** update dependency @elastic/eui to v51 ([#1624](https://github.com/elastic/elastic-charts/issues/1624)) ([64d87e5](https://github.com/elastic/elastic-charts/commit/64d87e58632c37f8e05ee179ab4fffb3e68233af))
* **deps:** update dependency @elastic/eui to v52 ([#1630](https://github.com/elastic/elastic-charts/issues/1630)) ([ada254e](https://github.com/elastic/elastic-charts/commit/ada254e563807e18bd7002f41c148c6ba7e78dc7))
* **goal:** chart placement and overlap issues ([#1620](https://github.com/elastic/elastic-charts/issues/1620)) ([b5d375b](https://github.com/elastic/elastic-charts/commit/b5d375b53499fcfb9640a4f4f18383a5f1afff1d))


### Features

* **goal:** expose max sizing limits in theme.goal options ([#1621](https://github.com/elastic/elastic-charts/issues/1621)) ([60a14ba](https://github.com/elastic/elastic-charts/commit/60a14ba87f3f63910df9aa99312dfe4b8d6ce847))

## [45.0.1](https://github.com/elastic/elastic-charts/compare/v45.0.0...v45.0.1) (2022-03-04)


### Bug Fixes

* **heatmap:** align debug state with the visualized axis labels([#1619](https://github.com/elastic/elastic-charts/issues/1619)) ([8854522](https://github.com/elastic/elastic-charts/commit/88545226de9076a2a41d664e11d90b531a06c885))

# [45.0.0](https://github.com/elastic/elastic-charts/compare/v44.0.0...v45.0.0) (2022-03-04)


### Features

* **styles:** eui Amsterdam theme ([#1463](https://github.com/elastic/elastic-charts/issues/1463)) ([fea1445](https://github.com/elastic/elastic-charts/commit/fea1445999165cace4a9f812c05e8864baf9c0fc))


### BREAKING CHANGES

* **styles:** chart color and style changes

# [44.0.0](https://github.com/elastic/elastic-charts/compare/v43.1.1...v44.0.0) (2022-03-01)


### Bug Fixes

* **axis:** correct tick alignment in ordinal scale with numeric values ([#1609](https://github.com/elastic/elastic-charts/issues/1609)) ([915349d](https://github.com/elastic/elastic-charts/commit/915349d21e1bb75a0a8522ed6fdadfdfa9c3910d))
* **legend:** width with duplicate nested pie slice labels ([#1585](https://github.com/elastic/elastic-charts/issues/1585)) ([1073231](https://github.com/elastic/elastic-charts/commit/10732310feaf311803ced0ec626610d8c2401419))
* **partition:** consider legend extras when computing the legend size ([#1611](https://github.com/elastic/elastic-charts/issues/1611)) ([2078f3d](https://github.com/elastic/elastic-charts/commit/2078f3db6ba6fa1270ec8ebc06fcbc21044814d6))
* **xy:** dataIndex keeps original data order on small multiples ([#1597](https://github.com/elastic/elastic-charts/issues/1597)) ([9e2566c](https://github.com/elastic/elastic-charts/commit/9e2566cc9ae057e33a05b65093ba039acbe48442))


### Features

* **api:** expose Predicate enum ([#1574](https://github.com/elastic/elastic-charts/issues/1574)) ([1f73eec](https://github.com/elastic/elastic-charts/commit/1f73eecca590e6115f1b315148a890032447e8eb))
* **heatmap:** allow rotation of x axis labels ([#1514](https://github.com/elastic/elastic-charts/issues/1514)) ([b655156](https://github.com/elastic/elastic-charts/commit/b655156911710d2ef8e18c8dbff836030e5df175))


### BREAKING CHANGES

* **heatmap:** `width`, `align`, and `baseline` style properties are removed from the `xAxisLabels` and `yAxisLabels` style of the Heatmap theme.

Co-authored-by: Marco Vettorello <vettorello.marco@gmail.com>

## [43.1.1](https://github.com/elastic/elastic-charts/compare/v43.1.0...v43.1.1) (2022-01-26)


### Bug Fixes

* revert removal of resize observer polyfill ([#1570](https://github.com/elastic/elastic-charts/issues/1570)) ([8a951f4](https://github.com/elastic/elastic-charts/commit/8a951f4bf2161eb59cc2d865b49fb47efe79e403))

# [43.1.0](https://github.com/elastic/elastic-charts/compare/v43.0.1...v43.1.0) (2022-01-25)


### Bug Fixes

* use window scope to call the ResizeObserver ([#1569](https://github.com/elastic/elastic-charts/issues/1569)) ([747e626](https://github.com/elastic/elastic-charts/commit/747e626f592e4e413567cd6710a95575e892aa71))


### Features

* **xy:** expose projection area ([#1567](https://github.com/elastic/elastic-charts/issues/1567)) ([b36a75a](https://github.com/elastic/elastic-charts/commit/b36a75a842af0d8e9c704e61b152e4423b4a69ca))

## [43.0.1](https://github.com/elastic/elastic-charts/compare/v43.0.0...v43.0.1) (2022-01-20)


### Bug Fixes

* **deps:** remove the ResizeObserver polyfill ([#1554](https://github.com/elastic/elastic-charts/issues/1554)) ([542f2bf](https://github.com/elastic/elastic-charts/commit/542f2bf3a20d5463c14d614cb55491430763e133))
* **deps:** update dependency puppeteer to v5.4.2 ([#1547](https://github.com/elastic/elastic-charts/issues/1547)) ([307e3e2](https://github.com/elastic/elastic-charts/commit/307e3e2481b0bcda9ff5aca2a5c1a4e90eefa176))
* **heatmap:** fix unpredictable tick count ([#1551](https://github.com/elastic/elastic-charts/issues/1551)) ([6242fad](https://github.com/elastic/elastic-charts/commit/6242fad5319a8d99935919804487e2686f071228))
* **heatmap:** text measure bugs ([#1560](https://github.com/elastic/elastic-charts/issues/1560)) ([5d83ab8](https://github.com/elastic/elastic-charts/commit/5d83ab82dadca5af13576225105e8ad2898fc389))

# [43.0.0](https://github.com/elastic/elastic-charts/compare/v42.1.0...v43.0.0) (2022-01-14)


### Bug Fixes

* **heatmap:** labels visibility regression ([#1549](https://github.com/elastic/elastic-charts/issues/1549)) ([067189d](https://github.com/elastic/elastic-charts/commit/067189d95b0dfd342f31bc819e3d6bc9df076533))
* **xy:** switch default timezone to `local` ([#1544](https://github.com/elastic/elastic-charts/issues/1544)) ([1233e69](https://github.com/elastic/elastic-charts/commit/1233e698e9d187b1fab55662754fca5f5459376e))


### BREAKING CHANGES

* **xy:** The time axis labels of a time-series chart configured without the timeZone prop are now rendering the labels with the local browser timezone instead of UTC.

# [42.1.0](https://github.com/elastic/elastic-charts/compare/v42.0.0...v42.1.0) (2022-01-10)


### Features

* allow multiple value accessors when computing the stack ratio ([#1537](https://github.com/elastic/elastic-charts/issues/1537)) ([c2eb4b8](https://github.com/elastic/elastic-charts/commit/c2eb4b8d91436975eee2ff499cac0dfa7bb33e56))

# [42.0.0](https://github.com/elastic/elastic-charts/compare/v41.0.1...v42.0.0) (2022-01-05)


### Bug Fixes

* **flamegraph:** solve animation regression occurring with 6db2677 ([#1541](https://github.com/elastic/elastic-charts/issues/1541)) ([5ec6037](https://github.com/elastic/elastic-charts/commit/5ec603767da22fe6cf2820536687aa77013436cc)), closes [#1540](https://github.com/elastic/elastic-charts/issues/1540)
* **heatmap:** render empty state ([#1532](https://github.com/elastic/elastic-charts/issues/1532)) ([59002df](https://github.com/elastic/elastic-charts/commit/59002df28e2a82f285c0375dd866655afb53abab))
* **waffle:** fix strange 0 text in legend item extra when label is 0 ([#1538](https://github.com/elastic/elastic-charts/issues/1538)) ([72224b9](https://github.com/elastic/elastic-charts/commit/72224b9bcbdc2ff9eb6c048fdba7dd13fac39db5))


### Features

* **goal:** add valueFormatter for tooltip ([#1529](https://github.com/elastic/elastic-charts/issues/1529)) ([8139973](https://github.com/elastic/elastic-charts/commit/8139973fb58c0ddb089da356904f50bea3f80817))
* **heatmap:** add axis titles ([#1503](https://github.com/elastic/elastic-charts/issues/1503)) ([a87325d](https://github.com/elastic/elastic-charts/commit/a87325d56ea4a3ce1eb7e3da688499f39427253a))
* **types:** improve generic types in specs, and spec prop types ([#1421](https://github.com/elastic/elastic-charts/issues/1421)) ([562929e](https://github.com/elastic/elastic-charts/commit/562929ef012aa80cc058b5c4a6dbe8f7226fb977))


### BREAKING CHANGES

* **types:** The `xAccessor` and `yAccessor` are now required on all xy chart specs. Stronger typing on `data` prop that may cause type errors when using untyped array (i.e. `const arr: never[] = []`). Other minor type changes related to spec types.
* **heatmap:** The heatmap yAxisLabel.padding style type is changed from Pixel | Partial<Padding> to Pixels | Padding. The heatmap axis labels are now correctly subjected to padding calculations and it will result in a slightly different position of labels.

Co-authored-by: Marco Vettorello <vettorello.marco@gmail.com>

## [41.0.1](https://github.com/elastic/elastic-charts/compare/v41.0.0...v41.0.1) (2021-12-20)


### Bug Fixes

* export deprecated partition config types ([#1530](https://github.com/elastic/elastic-charts/issues/1530)) ([00f0f8e](https://github.com/elastic/elastic-charts/commit/00f0f8e1590f6fa0e70b0255a03ba428eeb0f0cd))

# [41.0.0](https://github.com/elastic/elastic-charts/compare/v40.2.0...v41.0.0) (2021-12-17)


### Bug Fixes

* replace createRef with useRef in Functional Components. ([#1524](https://github.com/elastic/elastic-charts/issues/1524)) ([9538417](https://github.com/elastic/elastic-charts/commit/953841738afd80482ff4ee5cca01dc018861dcda))


### Code Refactoring

* **goal:** remove deprecated config ([#1408](https://github.com/elastic/elastic-charts/issues/1408)) ([312e31d](https://github.com/elastic/elastic-charts/commit/312e31df701e765328924bdeecb4191c3c7537d9))


### Features

* **heatmap:** dark mode with theme controls ([#1406](https://github.com/elastic/elastic-charts/issues/1406)) ([f29c8dd](https://github.com/elastic/elastic-charts/commit/f29c8dd2ac235ec3b9eaf225537e57c87e044056))
* **legend:** custom legend width ([#1467](https://github.com/elastic/elastic-charts/issues/1467)) ([51f50df](https://github.com/elastic/elastic-charts/commit/51f50df0d00c352808bd95d0f69010239d74ba4a))


### BREAKING CHANGES

* **goal:** The `GoalSpec.config` prop is removed. All properties have been moved/renamed under new `Theme.goal` options with the following exceptions:

- `Config.margin` is now controlled by `Theme.chartMargins` and is no longer a margin ratio as before.
- `Config.backgroundColor` is now controlled by `Theme.background.color`, even though it's not yet used.
- `fontFamily` moved into each respective label styles
- `angleStart` and `angleEnd` are moved onto the `GoalSpec` as optional values.
- `sectorLineWidth`, `width` and `height` all removed as they were never used.

# [40.2.0](https://github.com/elastic/elastic-charts/compare/v40.1.0...v40.2.0) (2021-12-09)


### Bug Fixes

* **partition:** linkLabel textColor override ([#1498](https://github.com/elastic/elastic-charts/issues/1498)) ([3013310](https://github.com/elastic/elastic-charts/commit/3013310357f3612aca47aa1c229d9ca4a276ea71))
* **waffle:** use descend sortPredicate by default ([#1510](https://github.com/elastic/elastic-charts/issues/1510)) ([763e2e3](https://github.com/elastic/elastic-charts/commit/763e2e3b71b7b2976b49f321d92aad60adfc4080))
* **xy:** stacked polarity ([#1502](https://github.com/elastic/elastic-charts/issues/1502)) ([920666a](https://github.com/elastic/elastic-charts/commit/920666acd012ce6f3e6c3299ebf338011e8a0e08)), closes [#1280](https://github.com/elastic/elastic-charts/issues/1280)


### Features

* **xy:** expose style for interpolation fit functions ([#1505](https://github.com/elastic/elastic-charts/issues/1505)) ([3071457](https://github.com/elastic/elastic-charts/commit/30714572e5eaf7b88bda0a26fd69f58357d5cc9f))

# [40.1.0](https://github.com/elastic/elastic-charts/compare/v40.0.0...v40.1.0) (2021-12-01)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^41.3.0 ([#1506](https://github.com/elastic/elastic-charts/issues/1506)) ([d364cc0](https://github.com/elastic/elastic-charts/commit/d364cc0fd0ecef83772ca1ca52ff04ed649badb6))
* remove pointer for onElementOver ([#1493](https://github.com/elastic/elastic-charts/issues/1493)) ([bf95dbc](https://github.com/elastic/elastic-charts/commit/bf95dbc6aae31d2c9994732b1c6ce6c29e58bd9a))
* **deps:** update dependency @elastic/eui to ^41.2.1 ([#1494](https://github.com/elastic/elastic-charts/issues/1494)) ([1c32f82](https://github.com/elastic/elastic-charts/commit/1c32f8264d9f03c304534a9b9688ee355d7fda39))


### Features

* expose computeRatioByGroups fn ([#1495](https://github.com/elastic/elastic-charts/issues/1495)) ([65f4886](https://github.com/elastic/elastic-charts/commit/65f4886ee3a1ef71eb34cfe8bd504ec4d76f82cb))

# [40.0.0](https://github.com/elastic/elastic-charts/compare/v39.0.2...v40.0.0) (2021-11-18)


### Bug Fixes

* **interactions:** remove the option for pixelRatio with png snapshot ([#1431](https://github.com/elastic/elastic-charts/issues/1431)) ([eebb069](https://github.com/elastic/elastic-charts/commit/eebb0697a0b9ec5a860feb687f5b52721850714b))
* **xy:** occlude points outside of y domain ([#1475](https://github.com/elastic/elastic-charts/issues/1475)) ([3176f02](https://github.com/elastic/elastic-charts/commit/3176f02c2587522f5b057493b592dc3446315998))


### Features

* **annotations:** add annotations to DebugState ([#1434](https://github.com/elastic/elastic-charts/issues/1434)) ([c5ea600](https://github.com/elastic/elastic-charts/commit/c5ea60027299882cc1c05f9227e7e3204bb0ff71))
* **heatmap:** add valueShown in heatmap debug state ([#1460](https://github.com/elastic/elastic-charts/issues/1460)) ([962e089](https://github.com/elastic/elastic-charts/commit/962e089fe61540dcd5ed3612d41d915c29b98d13))


### BREAKING CHANGES

* **interactions:** The getPNGSnapshot function no longer has an option for pixelRatio

## [39.0.2](https://github.com/elastic/elastic-charts/compare/v39.0.1...v39.0.2) (2021-11-17)


### Bug Fixes

* align axis tick formatter logic ([#1482](https://github.com/elastic/elastic-charts/issues/1482)) ([1bd30b9](https://github.com/elastic/elastic-charts/commit/1bd30b963d0136eb845381412737cb0e9dea4954)), closes [#1476](https://github.com/elastic/elastic-charts/issues/1476)
* **deps:** update dependency @elastic/eui to ^41.1.0 ([#1477](https://github.com/elastic/elastic-charts/issues/1477)) ([20306a1](https://github.com/elastic/elastic-charts/commit/20306a13bd1d7a3f021e8509a79099edccdb82fd))

## [39.0.1](https://github.com/elastic/elastic-charts/compare/v39.0.0...v39.0.1) (2021-11-15)


### Bug Fixes

* **partition:** rtl text label support ([#1433](https://github.com/elastic/elastic-charts/issues/1433)) ([01bbe3a](https://github.com/elastic/elastic-charts/commit/01bbe3a9109c8dddf71c259bfeafa67325920e84))

# [39.0.0](https://github.com/elastic/elastic-charts/compare/v38.1.5...v39.0.0) (2021-11-09)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v41 ([#1468](https://github.com/elastic/elastic-charts/issues/1468)) ([0c38291](https://github.com/elastic/elastic-charts/commit/0c38291f140218cbc993228ef821e8657c9bcf0c))
* **heatmap:** snap time bucket to calendar/fixed intervals ([#1462](https://github.com/elastic/elastic-charts/issues/1462)) ([b76c12c](https://github.com/elastic/elastic-charts/commit/b76c12c0a499acbb52c6333134d3ed2966b1b111))
* **xy:** handle zero-length time domains and switch to 24hr time ([#1464](https://github.com/elastic/elastic-charts/issues/1464)) ([379c2d6](https://github.com/elastic/elastic-charts/commit/379c2d6996f40df011201235f2ca3b28dae6f7a8))


### BREAKING CHANGES

* **heatmap:** The `xScaleType` is replaced by the prop `xScale`, which better describes a rasterized time scale with an Elasticsearch compliant interval.

## [38.1.5](https://github.com/elastic/elastic-charts/compare/v38.1.4...v38.1.5) (2021-11-05)


### Bug Fixes

* **legend:** legend breaking on words ([#1458](https://github.com/elastic/elastic-charts/issues/1458)) ([c42be98](https://github.com/elastic/elastic-charts/commit/c42be981b1b6a243dcfa5df9d978fb053e1aa5ed))

## [38.1.4](https://github.com/elastic/elastic-charts/compare/v38.1.3...v38.1.4) (2021-11-03)


### Bug Fixes

* **interactions:** line cursor above the chart, band cursor below ([#1453](https://github.com/elastic/elastic-charts/issues/1453)) ([d8d7ee0](https://github.com/elastic/elastic-charts/commit/d8d7ee0d204948e07235e7a949e9d33ea27c72ac))
* **theme:** merge partial with empty initial partial ([#1452](https://github.com/elastic/elastic-charts/issues/1452)) ([d1e690a](https://github.com/elastic/elastic-charts/commit/d1e690af35161eb660d41da34092b64179c238d8))

## [38.1.3](https://github.com/elastic/elastic-charts/compare/v38.1.2...v38.1.3) (2021-11-01)


### Bug Fixes

* **deps:** update dependency @elastic/eui to ^40.1.0 ([#1449](https://github.com/elastic/elastic-charts/issues/1449)) ([33a24fb](https://github.com/elastic/elastic-charts/commit/33a24fb87144c025d67bf6e3cc06215f1d326d06))
* **xy:** adding missing last tick and rarify gridlines ([#1448](https://github.com/elastic/elastic-charts/issues/1448)) ([002e4b8](https://github.com/elastic/elastic-charts/commit/002e4b809d0e224d04709ed8886f09f09137160a))

## [38.1.2](https://github.com/elastic/elastic-charts/compare/v38.1.1...v38.1.2) (2021-10-29)


### Bug Fixes

* **xy:** multilayer time axis tick/grid only when tick is inside domain ([#1446](https://github.com/elastic/elastic-charts/issues/1446)) ([1d06a1e](https://github.com/elastic/elastic-charts/commit/1d06a1e673255647a88a32c4d79fa71e113a6eba))
* **xy:** show mouse cursors on charts with opaque background ([#1447](https://github.com/elastic/elastic-charts/issues/1447)) ([e0f1543](https://github.com/elastic/elastic-charts/commit/e0f15438c8bc696ffee1b9054cbc45fd4200b8bd))

## [38.1.1](https://github.com/elastic/elastic-charts/compare/v38.1.0...v38.1.1) (2021-10-28)


### Bug Fixes

* **xy:** multilayer time axis tick/grid line placement and styling ([#1445](https://github.com/elastic/elastic-charts/issues/1445)) ([1ce4223](https://github.com/elastic/elastic-charts/commit/1ce4223f02b1723bbfa1b6132609b12590d52f59))

# [38.1.0](https://github.com/elastic/elastic-charts/compare/v38.0.1...v38.1.0) (2021-10-26)


### Bug Fixes

* **partition:** add get cursor pointer over slices ([#1428](https://github.com/elastic/elastic-charts/issues/1428)) ([af776ae](https://github.com/elastic/elastic-charts/commit/af776ae40f1e94b72789d3a0cac670f1855d49a0))


### Features

* **xy:** multilayer time axis ([#1430](https://github.com/elastic/elastic-charts/issues/1430)) ([3d25854](https://github.com/elastic/elastic-charts/commit/3d258549cebb598db2d839197af32d7a0fa6fe92))

## [38.0.1](https://github.com/elastic/elastic-charts/compare/v38.0.0...v38.0.1) (2021-10-15)


### Bug Fixes

* **legend:** floating legend scroll issue ([#1427](https://github.com/elastic/elastic-charts/issues/1427)) ([56ecbe2](https://github.com/elastic/elastic-charts/commit/56ecbe2f34304dfff9cb4427e91cb62eef063df5))

# [38.0.0](https://github.com/elastic/elastic-charts/compare/v37.0.0...v38.0.0) (2021-10-15)


### Bug Fixes

* **deps:** update dependency @elastic/eui to v39 ([#1422](https://github.com/elastic/elastic-charts/issues/1422)) ([2ee97aa](https://github.com/elastic/elastic-charts/commit/2ee97aa14d2893f2a215a524882d2bf0a86ddc47))
* **goal:** reduce whitespace for circular charts ([#1413](https://github.com/elastic/elastic-charts/issues/1413)) ([6517523](https://github.com/elastic/elastic-charts/commit/6517523fe05e43f00827ba3928d404c7006ac6d5))
* **interactions:** change allowBrushingLastHistogramBin to true ([#1396](https://github.com/elastic/elastic-charts/issues/1396)) ([9fa9783](https://github.com/elastic/elastic-charts/commit/9fa9783b4212d43141762936ac647218f3426119))
* **xy:** remove wrongly represented null/missing values in tooltip ([#1415](https://github.com/elastic/elastic-charts/issues/1415)) ([e5963a3](https://github.com/elastic/elastic-charts/commit/e5963a376ad1726a79d632391eef43c2a7a26adb)), closes [#1414](https://github.com/elastic/elastic-charts/issues/1414)


### Code Refactoring

* scales ([#1410](https://github.com/elastic/elastic-charts/issues/1410)) ([a53a2ba](https://github.com/elastic/elastic-charts/commit/a53a2ba4f4f8c881e7c4e4d85ac4eedfde02ccda))


### Features

* **scales:** add `LinearBinary` scale type ([#1389](https://github.com/elastic/elastic-charts/issues/1389)) ([9f2e427](https://github.com/elastic/elastic-charts/commit/9f2e42778ecb224293851739f390a03e76025eae))
* **xy:** adaptive tick raster ([#1420](https://github.com/elastic/elastic-charts/issues/1420)) ([200577b](https://github.com/elastic/elastic-charts/commit/200577b689ebfeb835401f6f5506f6b833e1268e))
* **xy:** apply the data value formatter to data values over bars ([#1419](https://github.com/elastic/elastic-charts/issues/1419)) ([e673fc7](https://github.com/elastic/elastic-charts/commit/e673fc776f494b45a35f6a4a18488d32e74050f3))


### BREAKING CHANGES

* **interactions:** allowBrushingLastHistogramBucket renamed to allowBrushingLastHistogramBin on the Settings component defaults true and is only applied for histogram type charts
* LogScaleOptions.logBase` is now a `number` instead of the object enum `LogBase`. Some edge case data or configuration _might_, with a deemed low likelihood, lead to a situation where the earlier version would have silently not rendered a bar, line or point, while the new code doesn't `catch`, therefore throw an exception (see the last item). General risk of regressions due to the quantity of code changes (altogether 3.5k)

# [37.0.0](https://github.com/elastic/elastic-charts/compare/v36.0.0...v37.0.0) (2021-10-05)


### Bug Fixes

* **debug:** add predictable axis labels sorting order ([#1418](https://github.com/elastic/elastic-charts/issues/1418)) ([60fbe7a](https://github.com/elastic/elastic-charts/commit/60fbe7aca9be73d34ce617aa990b717989cdeef4))
* **deps:** update dependency @elastic/eui to ^38.1.0 ([#1409](https://github.com/elastic/elastic-charts/issues/1409)) ([4ffd018](https://github.com/elastic/elastic-charts/commit/4ffd018e9a0afc0d2813d722be6c37d98dd7d378))
* **deps:** update dependency @elastic/eui to ^38.2.0 ([#1416](https://github.com/elastic/elastic-charts/issues/1416)) ([34707c3](https://github.com/elastic/elastic-charts/commit/34707c365b08ac383ab2d954cf94a5476db78bf4))


### Code Refactoring

* cleanup colors ([#1397](https://github.com/elastic/elastic-charts/issues/1397)) ([348c061](https://github.com/elastic/elastic-charts/commit/348c061e5aeacdd7990bae58a67af4532062729a))
* scale improvements and TS 4.4 ([#1383](https://github.com/elastic/elastic-charts/issues/1383)) ([0003bc1](https://github.com/elastic/elastic-charts/commit/0003bc193499481d9c7d9a7696c2ac8e89f6a91d))


### BREAKING CHANGES

* `DEFAULT_CHART_MARGINS`, `DEFAULT_GEOMETRY_STYLES`, `DEFAULT_CHART_PADDING` and `DEFAULT_MISSING_COLOR` are no longer exposed as part of the API
* The public type varieties for domains are discontinued, in favor of retaining the single `DomainRange` export, which now has a mandatory `{min: number, max: number}`. The developer can supply `NaN` where a finite min, max or both aren't defined (ie. in place of former effective `undefined`). In addition, some console.warn punctuations changed

Co-authored-by: Marco Vettorello <vettorello.marco@gmail.com>
Co-authored-by: Nick Partridge <nick.ryan.partridge@gmail.com>

# [36.0.0](https://github.com/elastic/elastic-charts/compare/v35.0.0...v36.0.0) (2021-09-15)


### Features

* **heatmap:** move onBrushEnd from config to Settings ([#1369](https://github.com/elastic/elastic-charts/issues/1369)) ([409a0c4](https://github.com/elastic/elastic-charts/commit/409a0c417f1d0636c291423637b31dbe35417fbe))


### BREAKING CHANGES

* **heatmap:** remove onBrushEnd from heatmap config and merge onBrushEnd in Settings with cartesian onBrushEnd

# [35.0.0](https://github.com/elastic/elastic-charts/compare/v34.2.1...v35.0.0) (2021-09-13)


### Bug Fixes

* **a11y:** restore focus after popover close with color picker ([#1272](https://github.com/elastic/elastic-charts/issues/1272)) ([0c6f945](https://github.com/elastic/elastic-charts/commit/0c6f9457e6c3ca028353111396c5da4908b20b54)), closes [#1266](https://github.com/elastic/elastic-charts/issues/1266) [#935](https://github.com/elastic/elastic-charts/issues/935)
* **build:** fix license in package.json ([#1362](https://github.com/elastic/elastic-charts/issues/1362)) ([d524fdf](https://github.com/elastic/elastic-charts/commit/d524fdf74735b039b2b85f4b10f384bf2fa2ff12))
* **deps:** update dependency @elastic/eui to ^37.5.0 ([#1341](https://github.com/elastic/elastic-charts/issues/1341)) ([fb05c98](https://github.com/elastic/elastic-charts/commit/fb05c988edbb8a98569d53e8d914fa96c475e82b))
* **deps:** update dependency @elastic/eui to ^37.6.1 ([#1359](https://github.com/elastic/elastic-charts/issues/1359)) ([2ae90ce](https://github.com/elastic/elastic-charts/commit/2ae90ceb4231ec8759c95871aa54d4993f155dff))
* **deps:** update dependency @elastic/eui to ^37.7.0 ([#1373](https://github.com/elastic/elastic-charts/issues/1373)) ([553b6b0](https://github.com/elastic/elastic-charts/commit/553b6b0a884e016ca435ea0fa5707c55323a6ec1))
* **heatmap:** filter out tooltip picked shapes in x-axis area ([#1351](https://github.com/elastic/elastic-charts/issues/1351)) ([174047d](https://github.com/elastic/elastic-charts/commit/174047d3cb26dba615397013735bff3d33185789)), closes [#1215](https://github.com/elastic/elastic-charts/issues/1215)
* **heatmap:** remove values when brushing only over axes ([#1364](https://github.com/elastic/elastic-charts/issues/1364)) ([77ff8d3](https://github.com/elastic/elastic-charts/commit/77ff8d356c6ab2e71f3aea05ea3eca0e61accef2))


### Features

* **annotations:** add onClickHandler for annotations ([#1293](https://github.com/elastic/elastic-charts/issues/1293)) ([48198be](https://github.com/elastic/elastic-charts/commit/48198be800f7a2d5d8ac3503e27a5e6065bf87bc)), closes [#1211](https://github.com/elastic/elastic-charts/issues/1211)
* **heatmap:** add text color contrast to heatmap cells ([#1342](https://github.com/elastic/elastic-charts/issues/1342)) ([f9a26ef](https://github.com/elastic/elastic-charts/commit/f9a26efc5e4a341d9fca8f0c174e93337153bff4)), closes [#1296](https://github.com/elastic/elastic-charts/issues/1296)
* **heatmap:** reduce font size to fit label within cells ([#1352](https://github.com/elastic/elastic-charts/issues/1352)) ([16b5546](https://github.com/elastic/elastic-charts/commit/16b5546e4954169f24bcac67b7c7bc9cf30c5ed0))
* **xy:** mutilayer time axis step 1 ([#1326](https://github.com/elastic/elastic-charts/issues/1326)) ([867b1f5](https://github.com/elastic/elastic-charts/commit/867b1f56116c2a13f5c669ad770301e69925a4ad))


### BREAKING CHANGES

* **xy:** - feat: removes the axis deduplication feature
- fix: `showDuplicatedTicks` causes a duplication check on the actual axis tick label (possibly yielded by `Axis.tickLabel` rather than the more general `tickFormat`)
* **heatmap:** the `config.label.fontSize` prop is replaced by `config.label.minFontSize` and `config.label.maxFontSize`. You can specify the same value for both properties to have a fixed font size. The `config.label.align` and `config.label.baseline` props are removed from the `HeatmapConfig` object.

## [34.2.1](https://github.com/elastic/elastic-charts/compare/v34.2.0...v34.2.1) (2021-08-25)


### Bug Fixes

* **partition:** small multiples panel title color ([#1329](https://github.com/elastic/elastic-charts/issues/1329)) ([8762d5e](https://github.com/elastic/elastic-charts/commit/8762d5e31d3e7843795b6d1427d10afe0aab4ed8)), closes [#1327](https://github.com/elastic/elastic-charts/issues/1327)

# [34.2.0](https://github.com/elastic/elastic-charts/compare/v34.1.1...v34.2.0) (2021-08-23)


### Bug Fixes

* **heatmap:** limit brush tool ([#1270](https://github.com/elastic/elastic-charts/issues/1270)) ([509cf42](https://github.com/elastic/elastic-charts/commit/509cf4209bfd359c2897e381980ff5e05b09ec27)), closes [#1216](https://github.com/elastic/elastic-charts/issues/1216)


### Features

* **goal:** dark mode with theme controls ([#1299](https://github.com/elastic/elastic-charts/issues/1299)) ([3a583e5](https://github.com/elastic/elastic-charts/commit/3a583e55a607c810a0764e841a632b42c5447b6a))

## [34.1.1](https://github.com/elastic/elastic-charts/compare/v34.1.0...v34.1.1) (2021-08-20)


### Bug Fixes

* **heatmap:** reuse the valueFormatter in legend ([#1318](https://github.com/elastic/elastic-charts/issues/1318)) ([e6a75d7](https://github.com/elastic/elastic-charts/commit/e6a75d759ea72b2d3b18f977d0e7bc5ff7e75177))

# [34.1.0](https://github.com/elastic/elastic-charts/compare/v34.0.0...v34.1.0) (2021-08-19)


### Bug Fixes

* **goal:** tooltip actual color ([#1302](https://github.com/elastic/elastic-charts/issues/1302)) ([dbe9d36](https://github.com/elastic/elastic-charts/commit/dbe9d36db891be44ff14deb35a02dbebc3926a48))
* **heatmap:** improve legend item ([#1317](https://github.com/elastic/elastic-charts/issues/1317)) ([49c35ce](https://github.com/elastic/elastic-charts/commit/49c35ce2f62c3ea861c184fc1b68693ab739eaad))
* **legend:** no truncation with single value ([#1316](https://github.com/elastic/elastic-charts/issues/1316)) ([7ec8a9f](https://github.com/elastic/elastic-charts/commit/7ec8a9fa60d4ccdbfe941b16168d29443c4b034a))


### Features

* **goal:** optional target tick ([#1301](https://github.com/elastic/elastic-charts/issues/1301)) ([88adf22](https://github.com/elastic/elastic-charts/commit/88adf22c5a9e6a6c0917e57e4c9b464a097491ab))

# [34.0.0](https://github.com/elastic/elastic-charts/compare/v33.2.4...v34.0.0) (2021-08-16)


### Code Refactoring

* **cartesian:** cartesian rendering iteration ([#1286](https://github.com/elastic/elastic-charts/issues/1286)) ([b2ae4f7](https://github.com/elastic/elastic-charts/commit/b2ae4f792e2e3aecbb240880634eee175dead1f3)), closes [#1202](https://github.com/elastic/elastic-charts/issues/1202)


### BREAKING CHANGES

* **cartesian:** - `TextStyle.fontStyle` is no longer a `string`, it's the more specific `FontStyle`
- For symmetry, `fontStyle` in word cloud is also switching from `string` to `FontStyle`
- Certain text configurations included both `fill` and `textColor` for the text color; `fill` got removed, because `textColor` is part of the public `Font` type, and because `textColor` has clearer meaning than `fill`. Yet, some of the code used the `fill` property and/or made the `fill` property also mandatory. So, userland code needs to remove some `fill` property, and might need to ensure that the correct value is going into `textColor`
- `getRadians` got unpublished
- No attempt to draw a rect border if there's not enough width/height for at least the specified border width (ie. width/height being at least twice the border width)

## [33.2.4](https://github.com/elastic/elastic-charts/compare/v33.2.3...v33.2.4) (2021-08-16)


### Bug Fixes

* add LICENSE file into the published package ([#1305](https://github.com/elastic/elastic-charts/issues/1305)) ([54520f0](https://github.com/elastic/elastic-charts/commit/54520f044bc00e27f9c9975dedd8ede28fcf3336))

## [33.2.3](https://github.com/elastic/elastic-charts/compare/v33.2.2...v33.2.3) (2021-08-16)


### Bug Fixes

* **heatmap:** compute nice legend items from color scale  ([#1273](https://github.com/elastic/elastic-charts/issues/1273)) ([0d392ae](https://github.com/elastic/elastic-charts/commit/0d392ae9ff7f09303b3643bbca7a24ccde39f84a)), closes [#1166](https://github.com/elastic/elastic-charts/issues/1166) [#1191](https://github.com/elastic/elastic-charts/issues/1191) [#1192](https://github.com/elastic/elastic-charts/issues/1192)

## [33.2.2](https://github.com/elastic/elastic-charts/compare/v33.2.1...v33.2.2) (2021-08-10)


### Bug Fixes

* polarity value filtering on non-log scales ([#1292](https://github.com/elastic/elastic-charts/issues/1292)) ([e75ad0b](https://github.com/elastic/elastic-charts/commit/e75ad0b7101b19ce23123f80f968948ba840473f))

## [33.2.1](https://github.com/elastic/elastic-charts/compare/v33.2.0...v33.2.1) (2021-08-09)


### Bug Fixes

* **bar:** filter zero-height bars from rendering ([#1281](https://github.com/elastic/elastic-charts/issues/1281)) ([e324521](https://github.com/elastic/elastic-charts/commit/e3245213db59c678ecf1197dc66a5b53b264973b)), closes [#1279](https://github.com/elastic/elastic-charts/issues/1279)

# [33.2.0](https://github.com/elastic/elastic-charts/compare/v33.1.0...v33.2.0) (2021-08-06)


### Bug Fixes

* heatmap snap domain to interval ([#1253](https://github.com/elastic/elastic-charts/issues/1253)) ([b439182](https://github.com/elastic/elastic-charts/commit/b4391821045c95ff2cb2ef6a33b925034eeba98d)), closes [#1165](https://github.com/elastic/elastic-charts/issues/1165)
* hex colors to allow alpha channel ([#1274](https://github.com/elastic/elastic-charts/issues/1274)) ([03b4f42](https://github.com/elastic/elastic-charts/commit/03b4f425781faa6df83c82f48e9635d418958ef4))


### Features

* **bullet:** the tooltip shows up around the drawn part of the chart only ([#1278](https://github.com/elastic/elastic-charts/issues/1278)) ([a96cbb4](https://github.com/elastic/elastic-charts/commit/a96cbb44feefc5e7ccfa249b8aecdfab81249fdd))
* **legend:** multiline labels with maxLines option ([#1285](https://github.com/elastic/elastic-charts/issues/1285)) ([e0eb096](https://github.com/elastic/elastic-charts/commit/e0eb096aa41fb8ba24b4e397b7fe0a0ecbd2cfcd))

# [33.1.0](https://github.com/elastic/elastic-charts/compare/v33.0.2...v33.1.0) (2021-07-28)


### Bug Fixes

* persisted color via color picker ([#1265](https://github.com/elastic/elastic-charts/issues/1265)) ([4205a7f](https://github.com/elastic/elastic-charts/commit/4205a7fc85ecb2fc36a65a64f8b8c667637586aa))


### Features

* **legend:** add point shape styles to legend item ([#1227](https://github.com/elastic/elastic-charts/issues/1227)) ([46be1d1](https://github.com/elastic/elastic-charts/commit/46be1d153dcf8369caff8a2092a1e38966139afb))
* **partition:** waffle chart ([#1255](https://github.com/elastic/elastic-charts/issues/1255)) ([156662a](https://github.com/elastic/elastic-charts/commit/156662a3ffa60d08c2ea94a8aa3778c13b533530))

## [33.0.2](https://github.com/elastic/elastic-charts/compare/v33.0.1...v33.0.2) (2021-07-20)


### Bug Fixes

* **xy:** interaction in linear/log x scales ([#1258](https://github.com/elastic/elastic-charts/issues/1258)) ([db94db2](https://github.com/elastic/elastic-charts/commit/db94db25e0e4fb977ef812a4547d8bc121c9db29))

## [33.0.1](https://github.com/elastic/elastic-charts/compare/v33.0.0...v33.0.1) (2021-07-16)


### Bug Fixes

* **a11y:** goal chart bugs ([#1256](https://github.com/elastic/elastic-charts/issues/1256)) ([5ff47dd](https://github.com/elastic/elastic-charts/commit/5ff47dd016725822e2a46dbd01a2849907d11bf3))
* slackbot package name ([#1254](https://github.com/elastic/elastic-charts/issues/1254)) ([7999020](https://github.com/elastic/elastic-charts/commit/7999020c762d397c5bd5198be6ffb99559adb8c7))

# [33.0.0](https://github.com/elastic/elastic-charts/compare/v32.0.0...v33.0.0) (2021-07-14)


### Features

* **xy:** add null bars to geometry indexing ([#1226](https://github.com/elastic/elastic-charts/issues/1226)) ([20b81a9](https://github.com/elastic/elastic-charts/commit/20b81a9228d49d4516930671169e9503aaad8d1d)), closes [#950](https://github.com/elastic/elastic-charts/issues/950)
* **xy:** hide labels that protrude the bar geometry ([#1233](https://github.com/elastic/elastic-charts/issues/1233)) ([be1fb3d](https://github.com/elastic/elastic-charts/commit/be1fb3de28b62731b0d972b922e469ebc8c8b36f)), closes [#1234](https://github.com/elastic/elastic-charts/issues/1234)


### BREAKING CHANGES

* **xy:** an API change is introduced: `hideClippedValue` is removed in favor of `overflowConstraints?: Array<LabelOverflowConstraint>;`. The array can contain one or multiple overflow constraints enumerated as `LabelOverflowConstraint`

# [32.0.0](https://github.com/elastic/elastic-charts/compare/v31.1.0...v32.0.0) (2021-07-12)


### chore

* **license:** elastic license 2.0 ([#1242](https://github.com/elastic/elastic-charts/issues/1242)) ([67fa0a3](https://github.com/elastic/elastic-charts/commit/67fa0a3b0d9e90db4057431099111ae0e8a21de3)), closes [#1213](https://github.com/elastic/elastic-charts/issues/1213)


### Features

* **a11y:** allow user to add optional semantic meaning to goal/gauge charts ([#1218](https://github.com/elastic/elastic-charts/issues/1218)) ([87629e2](https://github.com/elastic/elastic-charts/commit/87629e23e7cc8aef125a8b6d2b87092085abe2bd)), closes [#1161](https://github.com/elastic/elastic-charts/issues/1161)


### BREAKING CHANGES

* **license:** the library is released now under Elastic License 2.0 and SSPL

# [31.1.0](https://github.com/elastic/elastic-charts/compare/v31.0.0...v31.1.0) (2021-07-06)


### Bug Fixes

* **heatmap:** pick correct brush end value ([#1230](https://github.com/elastic/elastic-charts/issues/1230)) ([57678fe](https://github.com/elastic/elastic-charts/commit/57678fee789e3c19229f279fc0c3246a50b5c56f)), closes [#1229](https://github.com/elastic/elastic-charts/issues/1229)


### Features

* **a11y:** accessible goal and gauge chart ([#1174](https://github.com/elastic/elastic-charts/issues/1174)) ([ffa8822](https://github.com/elastic/elastic-charts/commit/ffa88226c4d0c9107df3f324ff99628322a7d1eb)), closes [#1160](https://github.com/elastic/elastic-charts/issues/1160)

# [31.0.0](https://github.com/elastic/elastic-charts/compare/v30.2.0...v31.0.0) (2021-06-29)


### Bug Fixes

* **xy:** render gridlines behind axis  ([#1204](https://github.com/elastic/elastic-charts/issues/1204)) ([38ebe2d](https://github.com/elastic/elastic-charts/commit/38ebe2d502cb1449a771f803a90db1811093fe64)), closes [#1203](https://github.com/elastic/elastic-charts/issues/1203)
* memory leak related to re-reselect cache ([#1201](https://github.com/elastic/elastic-charts/issues/1201)) ([02025cf](https://github.com/elastic/elastic-charts/commit/02025cf000948bf5e183f12e6cded7abc9e8d547))
* **partition:** getLegendItemsExtra no longer assumes a singleton ([#1199](https://github.com/elastic/elastic-charts/issues/1199)) ([100145b](https://github.com/elastic/elastic-charts/commit/100145b227b122bc082b6038ca23f8d166ec0363))


### Features

* **annotations:** option to render rect annotations outside chart ([#1207](https://github.com/elastic/elastic-charts/issues/1207)) ([4eda382](https://github.com/elastic/elastic-charts/commit/4eda382d2f99902ad129fd42febfe6a3c8419cf8))
* **heatmap:** enable brushing on categorical charts ([#1212](https://github.com/elastic/elastic-charts/issues/1212)) ([10c3493](https://github.com/elastic/elastic-charts/commit/10c3493a29e1e5f6778fd9d4c7acee00d979e81c)), closes [#1170](https://github.com/elastic/elastic-charts/issues/1170) [#1171](https://github.com/elastic/elastic-charts/issues/1171)
* **xy:** add onPointerUpdate debounce and trigger options ([#1194](https://github.com/elastic/elastic-charts/issues/1194)) ([a9a9b25](https://github.com/elastic/elastic-charts/commit/a9a9b2517cdd9787077d7fa49029d815c1b845f2))


### BREAKING CHANGES

* **xy:** the `PointerOverEvent` type now extends `ProjectedValues` and drops value. This effectively replaces value with `x`, `y`, `smVerticalValue` and `smHorizontalValue`.

# [30.2.0](https://github.com/elastic/elastic-charts/compare/v30.1.0...v30.2.0) (2021-06-10)


### Features

* **a11y:** add data table for screen readers (sunburst,  treemap, icicle, flame) ([#1155](https://github.com/elastic/elastic-charts/issues/1155)) ([87fd75f](https://github.com/elastic/elastic-charts/commit/87fd75facf96845629307ef3d2f5d67a4f9029d1)), closes [#1154](https://github.com/elastic/elastic-charts/issues/1154)

# [30.1.0](https://github.com/elastic/elastic-charts/compare/v30.0.0...v30.1.0) (2021-06-08)


### Features

* **a11y:** add textures to fill options ([#1138](https://github.com/elastic/elastic-charts/issues/1138)) ([fd0479f](https://github.com/elastic/elastic-charts/commit/fd0479fa5d0e84d842fa40d77db815325d39fa31))

# [30.0.0](https://github.com/elastic/elastic-charts/compare/v29.2.0...v30.0.0) (2021-06-04)


### Bug Fixes

* **domain:** custom domain should not filter data ([#1181](https://github.com/elastic/elastic-charts/issues/1181)) ([76e8dca](https://github.com/elastic/elastic-charts/commit/76e8dcafd11452359ff54c8e05eeafa45c380c6a)), closes [#1129](https://github.com/elastic/elastic-charts/issues/1129)
* **value_labels:** zero as a valid value for textBorder and borderWidth ([#1182](https://github.com/elastic/elastic-charts/issues/1182)) ([a64f333](https://github.com/elastic/elastic-charts/commit/a64f33321d80ea70d3010da50e6c8f9f9bf23620))
* annotation tooltip display when remounting specs ([#1167](https://github.com/elastic/elastic-charts/issues/1167)) ([8408600](https://github.com/elastic/elastic-charts/commit/840860019a78896dbde91372b2445da9b6e8403e))
* render nodeLabel formatted text into the nodes ([#1173](https://github.com/elastic/elastic-charts/issues/1173)) ([b44bdff](https://github.com/elastic/elastic-charts/commit/b44bdff9049802968d095d440a874daa904d6f1e))


### Features

* **axis:** allow pixel domain padding for y axes  ([#1145](https://github.com/elastic/elastic-charts/issues/1145)) ([7c1fa8e](https://github.com/elastic/elastic-charts/commit/7c1fa8e817c997eaa0c232db3b15ce92baf35a59))
* apply value formatter to the default legend item label ([#1190](https://github.com/elastic/elastic-charts/issues/1190)) ([71474a5](https://github.com/elastic/elastic-charts/commit/71474a5b7a12d522196ea71d866a572caa2fbf1f))
* **tooltip:** stickTo vertical middle of the cursor ([#1163](https://github.com/elastic/elastic-charts/issues/1163)) ([380363b](https://github.com/elastic/elastic-charts/commit/380363bfb8fc02a3eb22d5832edddba76438314d)), closes [#1108](https://github.com/elastic/elastic-charts/issues/1108)
* **wordcloud:** click and over events on text ([#1180](https://github.com/elastic/elastic-charts/issues/1180)) ([196fb6a](https://github.com/elastic/elastic-charts/commit/196fb6a644333ff16ccf1729b1aaa7d0a92fe21d)), closes [#1156](https://github.com/elastic/elastic-charts/issues/1156)


### BREAKING CHANGES

* **value_labels:** the `textBorder` of `ValueFillDefinition` is now optional or a number only
* **axis:** `domain.padding` now only takes a `number` value. If you are using a percent-based padding such as `'10%'` please set `domain.padding` to `0.1` and `domain.paddingUnit` to `DomainPaddingUnit.DomainRatio`.
* **axis:** `yScaleToDataExtent` is removed in favor of `domain.fit`. The functionality is the
same.

# [29.2.0](https://github.com/elastic/elastic-charts/compare/v29.1.0...v29.2.0) (2021-05-25)


### Bug Fixes

* **legend:** disable handleLabelClick for one legend item ([#1134](https://github.com/elastic/elastic-charts/issues/1134)) ([a7242af](https://github.com/elastic/elastic-charts/commit/a7242af3fe22db0b5cd4d8776e150972a665f242)), closes [#1055](https://github.com/elastic/elastic-charts/issues/1055)


### Features

* **a11y:** add alt text for all chart types  ([#1118](https://github.com/elastic/elastic-charts/issues/1118)) ([9e42229](https://github.com/elastic/elastic-charts/commit/9e42229b9fba27ca4396d76f45f4bf5785e445b0)), closes [#1107](https://github.com/elastic/elastic-charts/issues/1107)
* **legend:** specify number of columns on floating legend ([#1159](https://github.com/elastic/elastic-charts/issues/1159)) ([c2e4652](https://github.com/elastic/elastic-charts/commit/c2e465224d3e56790f6c9d3c5e0f4083051c38e1)), closes [#1158](https://github.com/elastic/elastic-charts/issues/1158)
* simple screenspace constraint solver ([#1141](https://github.com/elastic/elastic-charts/issues/1141)) ([eb11480](https://github.com/elastic/elastic-charts/commit/eb11480e2c8a1651c6449decc46b3cdf7311f68f))

# [29.1.0](https://github.com/elastic/elastic-charts/compare/v29.0.0...v29.1.0) (2021-04-23)


### Bug Fixes

* **interaction:** remove unnecessary elements ([#1131](https://github.com/elastic/elastic-charts/issues/1131)) ([411042f](https://github.com/elastic/elastic-charts/commit/411042fdbc8252a217f2e655fc12c0723c39cad1)), closes [#1074](https://github.com/elastic/elastic-charts/issues/1074)
* **partition:**  fix safari highlight bug on single slice ([#1132](https://github.com/elastic/elastic-charts/issues/1132)) ([4a04063](https://github.com/elastic/elastic-charts/commit/4a04063d68a3db27990eb460c00d7007aad4f169)), closes [#1085](https://github.com/elastic/elastic-charts/issues/1085)


### Features

* **tooltip:** add stickTo option ([#1122](https://github.com/elastic/elastic-charts/issues/1122)) ([12417e2](https://github.com/elastic/elastic-charts/commit/12417e2c03588202da0567cd0056393f00d990e6)), closes [#921](https://github.com/elastic/elastic-charts/issues/921)

# [29.0.0](https://github.com/elastic/elastic-charts/compare/v28.2.0...v29.0.0) (2021-04-22)


### Features

* **a11y:** add label for screen readers ([#1121](https://github.com/elastic/elastic-charts/issues/1121)) ([920e585](https://github.com/elastic/elastic-charts/commit/920e5856d4c52416c0ea394e5605bb756266b178)), closes [#1096](https://github.com/elastic/elastic-charts/issues/1096)
* **annotations:** marker body with dynamic positioning ([#1116](https://github.com/elastic/elastic-charts/issues/1116)) ([601abac](https://github.com/elastic/elastic-charts/commit/601abacc4247755ad1203439e6e95c6fa8574ab2))


### BREAKING CHANGES

* **a11y:** `description` prop in `<Settings/>` is renamed to `ariaDescription`

Co-authored-by: Marco Vettorello <vettorello.marco@gmail.com>

# [28.2.0](https://github.com/elastic/elastic-charts/compare/v28.1.0...v28.2.0) (2021-04-15)


### Bug Fixes

* **xy:** consider `useDefaultGroupDomain` on scale config ([#1119](https://github.com/elastic/elastic-charts/issues/1119)) ([c1b59f2](https://github.com/elastic/elastic-charts/commit/c1b59f249a1fdfc5d6f714de8db99cbf7a16c6eb)), closes [#1087](https://github.com/elastic/elastic-charts/issues/1087)


### Features

* **a11y:** allow user to pass custom description for screen readers ([#1111](https://github.com/elastic/elastic-charts/issues/1111)) ([2ee1b91](https://github.com/elastic/elastic-charts/commit/2ee1b912f58cff4964786ce6586b07390bbed0b3)), closes [#1097](https://github.com/elastic/elastic-charts/issues/1097)
* **partition:** add debuggable state ([#1117](https://github.com/elastic/elastic-charts/issues/1117)) ([d7fc206](https://github.com/elastic/elastic-charts/commit/d7fc2068ca5febba06e25cf67b91cf9d203bc5d3)), closes [#917](https://github.com/elastic/elastic-charts/issues/917)

# [28.1.0](https://github.com/elastic/elastic-charts/compare/v28.0.1...v28.1.0) (2021-04-13)


### Bug Fixes

* **legend:** sizing for short labels with scrollbar ([#1115](https://github.com/elastic/elastic-charts/issues/1115)) ([6e1f223](https://github.com/elastic/elastic-charts/commit/6e1f223d5126c2707101d269ebaa5dc117ac61c4))
* **xy:** negative bar highlight and click ([#1109](https://github.com/elastic/elastic-charts/issues/1109)) ([ec17cb2](https://github.com/elastic/elastic-charts/commit/ec17cb2eb2f13e0be4370a2dc89d3872f9b6de5a)), closes [#1100](https://github.com/elastic/elastic-charts/issues/1100)


### Features

* **a11y:** improve chart figure ([#1104](https://github.com/elastic/elastic-charts/issues/1104)) ([815cf39](https://github.com/elastic/elastic-charts/commit/815cf39873e3e1f0a526dd88bb06c2b87f22f9e8))
* **partition:** order slices and sectors ([#1112](https://github.com/elastic/elastic-charts/issues/1112)) ([74df29b](https://github.com/elastic/elastic-charts/commit/74df29b5554eaa5b88c670c71321ce676683da6f))
* **partitions:** small multipies events pass on smAccessorValue ([#1106](https://github.com/elastic/elastic-charts/issues/1106)) ([a3234fe](https://github.com/elastic/elastic-charts/commit/a3234feee9e579cf7bdb21d487f80c8200a0fa73))
* **xy:** optionally rounds the domain to nice values ([#1087](https://github.com/elastic/elastic-charts/issues/1087)) ([f644cc4](https://github.com/elastic/elastic-charts/commit/f644cc4653bf4bea3180057b981f80bdcabee00f))
* **xy:** specify pixel and ratio width for bars ([#1114](https://github.com/elastic/elastic-charts/issues/1114)) ([58de413](https://github.com/elastic/elastic-charts/commit/58de413564a5f0b9a8bef9f5cb2119cdde18794f))
* mosaic ([#1113](https://github.com/elastic/elastic-charts/issues/1113)) ([64bdd88](https://github.com/elastic/elastic-charts/commit/64bdd88836210a4c4c997dc207859c3fbd773d80))

## [28.0.1](https://github.com/elastic/elastic-charts/compare/v28.0.0...v28.0.1) (2021-04-06)


### Bug Fixes

* filter out zero values on fitted log domains ([#1057](https://github.com/elastic/elastic-charts/issues/1057)) ([88d71ff](https://github.com/elastic/elastic-charts/commit/88d71ff810d33756d5c568b7f5c603a84837490d))

# [28.0.0](https://github.com/elastic/elastic-charts/compare/v27.0.0...v28.0.0) (2021-04-02)


### Bug Fixes

* **annotations:** provide fallback for line annotation markers ([#1091](https://github.com/elastic/elastic-charts/issues/1091)) ([0bd61f1](https://github.com/elastic/elastic-charts/commit/0bd61f198743461c267eed74706797b49508e250))
* **legend:** action sizing ui and focus states ([#1102](https://github.com/elastic/elastic-charts/issues/1102)) ([3a76a2c](https://github.com/elastic/elastic-charts/commit/3a76a2c3977983f8eec1c88d0b4cb73bc5d1e8ee))
* **legend:** stop legend color picker dot twitching ([#1101](https://github.com/elastic/elastic-charts/issues/1101)) ([c89b767](https://github.com/elastic/elastic-charts/commit/c89b767c698b677cef96da365901dc046d6e27a8))


### Code Refactoring

* rename enum types to singular ([#1064](https://github.com/elastic/elastic-charts/issues/1064)) ([396b3d1](https://github.com/elastic/elastic-charts/commit/396b3d1aefc995b89c6acb369c19a82f2a68d7b5)), closes [#767](https://github.com/elastic/elastic-charts/issues/767)


### BREAKING CHANGES

* `AnnotationDomainTypes`, `AnnotationTypes`, `SeriesTypes`, `ChartTypes`, and `SpecTypes` are renamed to `AnnotationDomainType`, `AnnotationType`, `SeriesType`, `ChartType`, and `SpecType`

# [27.0.0](https://github.com/elastic/elastic-charts/compare/v26.1.0...v27.0.0) (2021-03-31)


### Features

* **partitions:** Small multiples legends ([#1094](https://github.com/elastic/elastic-charts/issues/1094)) ([c39d113](https://github.com/elastic/elastic-charts/commit/c39d11388f74bbaef1dc2ed0b4febabd25b35241))


### BREAKING CHANGES

* **partitions:** the `flatLegend` (true) option yields alphabetical, formatted name based sorting for unique name/color occurrences, to make it easy for the user to look up names in the legend as it's alphabetically sorted

# [26.1.0](https://github.com/elastic/elastic-charts/compare/v26.0.0...v26.1.0) (2021-03-26)


### Features

* **a11y:** add basic aria-label to canvas element ([#1084](https://github.com/elastic/elastic-charts/issues/1084)) ([1a5aef7](https://github.com/elastic/elastic-charts/commit/1a5aef772315786eba8c623f728a72475d7f91d4))
* **xy_charts:** render legend inside the chart ([#1031](https://github.com/elastic/elastic-charts/issues/1031)) ([ba88122](https://github.com/elastic/elastic-charts/commit/ba8812213d6d6463f66f267cc095928d1a7a2abe)), closes [#861](https://github.com/elastic/elastic-charts/issues/861)

# [26.0.0](https://github.com/elastic/elastic-charts/compare/v25.4.0...v26.0.0) (2021-03-23)


### Features

* **partition:** small multiples ([#1076](https://github.com/elastic/elastic-charts/issues/1076)) ([282082b](https://github.com/elastic/elastic-charts/commit/282082b0316d8e2fe5229761112cd209d70802b8))


### BREAKING CHANGES

* **partition:** clarifies the inner/outer padding notation `<SmallMultiples style={{horizontalPanelPadding, verticalPanelPadding}}` from `[outer, inner]` to `{outer, inner}`—they still have the same effect

# [25.4.0](https://github.com/elastic/elastic-charts/compare/v25.3.0...v25.4.0) (2021-03-23)


### Bug Fixes

* chromium area path render bug ([#1067](https://github.com/elastic/elastic-charts/issues/1067)) ([e16d15d](https://github.com/elastic/elastic-charts/commit/e16d15d92add87f0bfe580a7301975915c10c381))


### Features

* **tooltip:** expose datum in the TooltipValue ([#1082](https://github.com/elastic/elastic-charts/issues/1082)) ([0246784](https://github.com/elastic/elastic-charts/commit/0246784bf4f88b374b7a28ffa4a60380f4c162b4)), closes [#1042](https://github.com/elastic/elastic-charts/issues/1042)
* **wordcloud:** wordcloud ([#1038](https://github.com/elastic/elastic-charts/issues/1038)) ([f08f4c9](https://github.com/elastic/elastic-charts/commit/f08f4c9b7472d8c81a0fa56cd7dc7018eed637ad))

# [25.3.0](https://github.com/elastic/elastic-charts/compare/v25.2.0...v25.3.0) (2021-03-11)


### Bug Fixes

* **brush:** force brush tool per panel ([#1071](https://github.com/elastic/elastic-charts/issues/1071)) ([8f866fc](https://github.com/elastic/elastic-charts/commit/8f866fca9c99ebf675fd31bf57b4b63d9f2eed09)), closes [#1070](https://github.com/elastic/elastic-charts/issues/1070)


### Features

* debug state for the heatmap chart  ([#976](https://github.com/elastic/elastic-charts/issues/976)) ([2ae2bbc](https://github.com/elastic/elastic-charts/commit/2ae2bbcb85e26c62a18cad2d4d6a4e4fc1ab29eb))

# [25.2.0](https://github.com/elastic/elastic-charts/compare/v25.1.1...v25.2.0) (2021-03-09)


### Bug Fixes

* **tooltip:** add boundary padding ([#1065](https://github.com/elastic/elastic-charts/issues/1065)) ([25a247e](https://github.com/elastic/elastic-charts/commit/25a247ef043d3ba2a5029f68ebcfebb6493df8ab))


### Features

* **partition:** flame and icicle performance and tweening ([#1041](https://github.com/elastic/elastic-charts/issues/1041)) ([a9648a4](https://github.com/elastic/elastic-charts/commit/a9648a40d4aa06f5c715f293121d278543aec94c))

## [25.1.1](https://github.com/elastic/elastic-charts/compare/v25.1.0...v25.1.1) (2021-03-05)


### Bug Fixes

* clippedRanges when complete dataset is null ([#1037](https://github.com/elastic/elastic-charts/issues/1037)) ([51418d2](https://github.com/elastic/elastic-charts/commit/51418d2b9feae8b48f568a39975f7152abdf67e5))
* **tooltip:** allow explicit boundary element ([#1049](https://github.com/elastic/elastic-charts/issues/1049)) ([5cf8461](https://github.com/elastic/elastic-charts/commit/5cf8461530e4cac1c1f9918db54e96bf91cdad39))

# [25.1.0](https://github.com/elastic/elastic-charts/compare/v25.0.1...v25.1.0) (2021-03-01)


### Bug Fixes

* rounding values on stacked w percentage charts ([#1039](https://github.com/elastic/elastic-charts/issues/1039)) ([ee63a70](https://github.com/elastic/elastic-charts/commit/ee63a7050f4230e85cd11f83df0d47bc6851cc83))


### Features

* **axis:** log scale limit and base options ([#1032](https://github.com/elastic/elastic-charts/issues/1032)) ([b38d110](https://github.com/elastic/elastic-charts/commit/b38d11083b921bb1e2759640cfa9498087c47b52))
* **partition:** clip text in partition chart fill label ([#1033](https://github.com/elastic/elastic-charts/issues/1033)) ([be9bea0](https://github.com/elastic/elastic-charts/commit/be9bea0f4c4f2a2020dfde7a98d4e9e1baaf8a9a))

## [25.0.1](https://github.com/elastic/elastic-charts/compare/v25.0.0...v25.0.1) (2021-02-17)


### Reverts

* log scale improvements and options ([#1014](https://github.com/elastic/elastic-charts/issues/1014)) ([2189f92](https://github.com/elastic/elastic-charts/commit/2189f927214f6511add0435b3cd1677134a50011))

# [25.0.0](https://github.com/elastic/elastic-charts/compare/v24.6.0...v25.0.0) (2021-02-16)


### Bug Fixes

* group legend items by label and color ([#999](https://github.com/elastic/elastic-charts/issues/999)) ([5d32f23](https://github.com/elastic/elastic-charts/commit/5d32f23487cd458f87b007b841e8bf41bbeccd56))


### Features

* **axis:** log scale improvements and options ([#1014](https://github.com/elastic/elastic-charts/issues/1014)) ([0f52688](https://github.com/elastic/elastic-charts/commit/0f52688ba0f187b25d8790d394550abb14179225))


### BREAKING CHANGES

* The `LegendActionProps` and the `LegendColorPickerProps`, used to add actions and color picker through the legend now receive an array of `SeriesIdentifiers`

# [24.6.0](https://github.com/elastic/elastic-charts/compare/v24.5.1...v24.6.0) (2021-02-15)


### Bug Fixes

* **legend:** width with scroll bar ([#1019](https://github.com/elastic/elastic-charts/issues/1019)) ([45bd0d5](https://github.com/elastic/elastic-charts/commit/45bd0d5322cd547d88d5a618e4ae6e2aa4ec989c))


### Features

* sort values in actions by closest to cursor ([#1023](https://github.com/elastic/elastic-charts/issues/1023)) ([e1da4e5](https://github.com/elastic/elastic-charts/commit/e1da4e578f619f19813c7c3172ca2c972fe188a2))
* **axis:** small multiples axis improvements ([#1004](https://github.com/elastic/elastic-charts/issues/1004)) ([514466f](https://github.com/elastic/elastic-charts/commit/514466f557a5ef9a06ea35f0f091bcf33bfd8ae6))
* **partition:** drilldown ([#995](https://github.com/elastic/elastic-charts/issues/995)) ([20bbdae](https://github.com/elastic/elastic-charts/commit/20bbdaeade4134fef0e0f486af3693bf348733d4))

## [24.5.1](https://github.com/elastic/elastic-charts/compare/v24.5.0...v24.5.1) (2021-02-05)


### Bug Fixes

* missing exported types ([#1005](https://github.com/elastic/elastic-charts/issues/1005)) ([f6806de](https://github.com/elastic/elastic-charts/commit/f6806de28198e2a288039e78d585e3c8383722e7))

# [24.5.0](https://github.com/elastic/elastic-charts/compare/v24.4.0...v24.5.0) (2021-01-30)


### Bug Fixes

* add theme min radius to point shape ([#996](https://github.com/elastic/elastic-charts/issues/996)) ([eb37175](https://github.com/elastic/elastic-charts/commit/eb3717584a5db5a0ea56fdcfea1839c23d92900b))
* align tooltip z-index to EUI tooltip z-index ([#931](https://github.com/elastic/elastic-charts/issues/931)) ([ffd626b](https://github.com/elastic/elastic-charts/commit/ffd626baa8bc7ba3c00b8f5257ce9bac7d72c660))
* chart state and series functions cleanup ([#989](https://github.com/elastic/elastic-charts/issues/989)) ([944ac6c](https://github.com/elastic/elastic-charts/commit/944ac6cf1ce12f9993411cf44bb3fa51f25b1241))
* create unique ids for dot icons ([#971](https://github.com/elastic/elastic-charts/issues/971)) ([e1ce768](https://github.com/elastic/elastic-charts/commit/e1ce76893fe7ccb0e59116d4a8d420aef4655fea))
* external tooltip legend extra value sync ([#993](https://github.com/elastic/elastic-charts/issues/993)) ([13ad05a](https://github.com/elastic/elastic-charts/commit/13ad05ab19b58a034f81d6b43b8925315b49de6d))
* **legend:** disable focus and keyboard navigation for legend in partition ch… ([#952](https://github.com/elastic/elastic-charts/issues/952)) ([03bd2f7](https://github.com/elastic/elastic-charts/commit/03bd2f755038117b19e3e5b6459bfc75a51656d4))
* **legend:** hierarchical legend order should follow the tree paths ([#947](https://github.com/elastic/elastic-charts/issues/947)) ([f9218ad](https://github.com/elastic/elastic-charts/commit/f9218ad842d07a67eef4cbfb1209937db9da6853)), closes [#944](https://github.com/elastic/elastic-charts/issues/944)
* **legend:** remove ids for circles ([#973](https://github.com/elastic/elastic-charts/issues/973)) ([b3f4f90](https://github.com/elastic/elastic-charts/commit/b3f4f90e006f5b4c9b476460a71685396486cc54))


### Features

* **cursor:** improve theme styling for crosshair ([#980](https://github.com/elastic/elastic-charts/issues/980)) ([6c4dafd](https://github.com/elastic/elastic-charts/commit/6c4dafd1cdeed5b61ca4c89790faa707b5c083b5))
* **legend:**  display pie chart legend extra ([#939](https://github.com/elastic/elastic-charts/issues/939)) ([d14de01](https://github.com/elastic/elastic-charts/commit/d14de010c1d7ced362da274153d7f3c464c3170b))
* **legend:** add keyboard navigation ([#880](https://github.com/elastic/elastic-charts/issues/880)) ([87c227d](https://github.com/elastic/elastic-charts/commit/87c227da41dc4a6860f7ae895e80586ce8211092))
* **partition:** Flame and icicle chart ([#965](https://github.com/elastic/elastic-charts/issues/965)) ([3df73d0](https://github.com/elastic/elastic-charts/commit/3df73d0e1f74b66e688a64e477c78d5ed3225f0a))
* **partition:** legend hover options ([#978](https://github.com/elastic/elastic-charts/issues/978)) ([f810d94](https://github.com/elastic/elastic-charts/commit/f810d94c03f91191e9d86d156b25db22be888a59))
* **xy:** support multiple point shapes on line, area and bubble charts ([#988](https://github.com/elastic/elastic-charts/issues/988)) ([1392b7d](https://github.com/elastic/elastic-charts/commit/1392b7d8f77087fcb8592a3697e3eadae8db1f33))

# [24.4.0](https://github.com/elastic/elastic-charts/compare/v24.3.0...v24.4.0) (2020-12-09)


### Bug Fixes

* empty labels on debug state ([#940](https://github.com/elastic/elastic-charts/issues/940)) ([3c823fd](https://github.com/elastic/elastic-charts/commit/3c823fdbc8437c907c02b58c1aa8e084bc7611d1))


### Features

* allow use of functions for y, y0, split and stack accessors ([#943](https://github.com/elastic/elastic-charts/issues/943)) ([22425d3](https://github.com/elastic/elastic-charts/commit/22425d3b9819afde208c651abb6b017839556645))

# [24.3.0](https://github.com/elastic/elastic-charts/compare/v24.2.0...v24.3.0) (2020-12-04)


### Bug Fixes

* **highlighter:** show default highlighted radius with hidden dots ([#926](https://github.com/elastic/elastic-charts/issues/926)) ([8b167a4](https://github.com/elastic/elastic-charts/commit/8b167a46bd5d5878a682448c269718dc1076ea14)), closes [#679](https://github.com/elastic/elastic-charts/issues/679)
* **xy_chart:** improve line joins rendering ([#920](https://github.com/elastic/elastic-charts/issues/920)) ([ec8041a](https://github.com/elastic/elastic-charts/commit/ec8041a2ef8c5f5d173efc5981b2f52830ceaf4f))
* point highlight based on geom position and transform ([#934](https://github.com/elastic/elastic-charts/issues/934)) ([7198b5d](https://github.com/elastic/elastic-charts/commit/7198b5d47230558e6858076083232f46fa02e0f9))


### Features

* allow no results component, don't require series ([#936](https://github.com/elastic/elastic-charts/issues/936)) ([4766c23](https://github.com/elastic/elastic-charts/commit/4766c235ee6d15b2523b9177242e90157f7af8df))
* improved domain error handling ([#933](https://github.com/elastic/elastic-charts/issues/933)) ([94534a5](https://github.com/elastic/elastic-charts/commit/94534a5d37fc0b71508facc64881f14866603d9c))

# [24.2.0](https://github.com/elastic/elastic-charts/compare/v24.1.0...v24.2.0) (2020-11-25)


### Bug Fixes

* near and far alignments for orthogonal rotations ([#911](https://github.com/elastic/elastic-charts/issues/911)) ([cb279f3](https://github.com/elastic/elastic-charts/commit/cb279f32b0b306e590dd2c9a64b44788ab1c20bc))


### Features

* add projection click listener ([#913](https://github.com/elastic/elastic-charts/issues/913)) ([0fa9072](https://github.com/elastic/elastic-charts/commit/0fa9072566b4c9774cf7953041559a9ea99696d6)), closes [#846](https://github.com/elastic/elastic-charts/issues/846)

# [24.1.0](https://github.com/elastic/elastic-charts/compare/v24.0.0...v24.1.0) (2020-11-24)


### Bug Fixes

* **area_charts:** correctly represent baseline with negative data points ([#896](https://github.com/elastic/elastic-charts/issues/896)) ([d1243f1](https://github.com/elastic/elastic-charts/commit/d1243f1612e43ca454db5ff48bc6689ca48bb80a))
* **legend:** legend sizes with ordinal data ([#867](https://github.com/elastic/elastic-charts/issues/867)) ([7559e0d](https://github.com/elastic/elastic-charts/commit/7559e0dd43c76f4217c136a902f724bc0e406672)), closes [#811](https://github.com/elastic/elastic-charts/issues/811)
* render orphan data points on lines and areas ([#900](https://github.com/elastic/elastic-charts/issues/900)) ([0be282b](https://github.com/elastic/elastic-charts/commit/0be282b2d46e867348708f74ff752ca7dbd493fd)), closes [#783](https://github.com/elastic/elastic-charts/issues/783)
* specs swaps correctly reflected in state ([#901](https://github.com/elastic/elastic-charts/issues/901)) ([7fba882](https://github.com/elastic/elastic-charts/commit/7fba88254ce3d8f874acec34307fe2d75ffff6a6))


### Features

* **legend:** allow legend text to be copyable ([#877](https://github.com/elastic/elastic-charts/issues/877)) ([9cd3459](https://github.com/elastic/elastic-charts/commit/9cd34591b6216b8aab208177e0e4a31e1c7268d7)), closes [#710](https://github.com/elastic/elastic-charts/issues/710)
* allow clearing series colors from memory ([#899](https://github.com/elastic/elastic-charts/issues/899)) ([ab1af38](https://github.com/elastic/elastic-charts/commit/ab1af382e6b351f4607b90024afa60a7d5f3968a))
* merge series domain with the domain of another group ([#912](https://github.com/elastic/elastic-charts/issues/912)) ([325b013](https://github.com/elastic/elastic-charts/commit/325b013199004e45bd59bc419431656bd8c3830f))
* small multiples for XY charts (alpha) ([#793](https://github.com/elastic/elastic-charts/issues/793)) ([d288208](https://github.com/elastic/elastic-charts/commit/d28820858d013326b3c660381e70696e9382166d)), closes [#500](https://github.com/elastic/elastic-charts/issues/500) [#500](https://github.com/elastic/elastic-charts/issues/500)

# [24.0.0](https://github.com/elastic/elastic-charts/compare/v23.2.1...v24.0.0) (2020-10-19)


### Bug Fixes

* **annotation:** annotation rendering with no yDomain or groupId ([#842](https://github.com/elastic/elastic-charts/issues/842)) ([f173b49](https://github.com/elastic/elastic-charts/commit/f173b497d13b0de4a7103ea2cffc09e96d98d713)), closes [#438](https://github.com/elastic/elastic-charts/issues/438) [#798](https://github.com/elastic/elastic-charts/issues/798)


### Features

* **bar_chart:** add Alignment offset to value labels ([#784](https://github.com/elastic/elastic-charts/issues/784)) ([363aeb4](https://github.com/elastic/elastic-charts/commit/363aeb48c43537ae6906188ec0dfe43efc725f68))
* **bar_chart:** add shadow prop for value labels ([#785](https://github.com/elastic/elastic-charts/issues/785)) ([9b29392](https://github.com/elastic/elastic-charts/commit/9b29392631e4ae92db24bb9077a9afacee051318))
* **bar_chart:** scaled font size for value labels ([#789](https://github.com/elastic/elastic-charts/issues/789)) ([3bdd1ee](https://github.com/elastic/elastic-charts/commit/3bdd1ee1194619db4b2af64037ae8eaeb2b2b186)), closes [#788](https://github.com/elastic/elastic-charts/issues/788)
* **heatmap:** allow fixed right margin ([#873](https://github.com/elastic/elastic-charts/issues/873)) ([16cf73c](https://github.com/elastic/elastic-charts/commit/16cf73c5c0a0fde1e10b4a89f347988d8f422bc3))


### BREAKING CHANGES

* **bar_chart:** The `DisplayValueStyle` `fontSize` property can now express an upper and lower bound as size, used for the automatic scaling.
* **bar_chart:** The `DisplayValueStyle` `fill` property can now express a border color and width, or let the library pick the best match based on contrast using the textInvertible parameter.

## [23.2.1](https://github.com/elastic/elastic-charts/compare/v23.2.0...v23.2.1) (2020-10-06)


### Bug Fixes

* detect dragging only by the delta changes ([#853](https://github.com/elastic/elastic-charts/issues/853)) ([219f9dd](https://github.com/elastic/elastic-charts/commit/219f9dd822b15750949ee3192fa573421eb8e534))
* filter highlighted y values ([#855](https://github.com/elastic/elastic-charts/issues/855)) ([d3ebe77](https://github.com/elastic/elastic-charts/commit/d3ebe776126af0257882d1fa3f94e8426a063fd3))

# [23.2.0](https://github.com/elastic/elastic-charts/compare/v23.1.1...v23.2.0) (2020-10-06)


### Bug Fixes

* **heatmap:** adjust pageSize based available chart height ([#849](https://github.com/elastic/elastic-charts/issues/849)) ([9aa396b](https://github.com/elastic/elastic-charts/commit/9aa396b59c1af4208663a78366a678ead54e6eca))
* **heatmap:** destroy canvas bbox calculator when done ([#844](https://github.com/elastic/elastic-charts/issues/844)) ([42460bd](https://github.com/elastic/elastic-charts/commit/42460bd649b6a8114a01fb63cd9bee01515f37b6))
* **heatmap:** x-axis labels overlapping for time series data ([#850](https://github.com/elastic/elastic-charts/issues/850)) ([9ebd879](https://github.com/elastic/elastic-charts/commit/9ebd8799881d6ee67a3a5a91cf0eb85f13f38ac8))
* **interactions:** recognise drag after 100ms and 4px ([#848](https://github.com/elastic/elastic-charts/issues/848)) ([70626fe](https://github.com/elastic/elastic-charts/commit/70626fe4ef34504c9c9d59b0abb1c6ec0d19b04d)), closes [#748](https://github.com/elastic/elastic-charts/issues/748)


### Features

* heatmap tooltip enhancements and fixes ([#847](https://github.com/elastic/elastic-charts/issues/847)) ([d879e05](https://github.com/elastic/elastic-charts/commit/d879e056f05c1651d04e2de8610cc2f194e6faa9))

## [23.1.1](https://github.com/elastic/elastic-charts/compare/v23.1.0...v23.1.1) (2020-10-05)


### Bug Fixes

* limit annotation to the current domain extent ([#841](https://github.com/elastic/elastic-charts/issues/841)) ([4186962](https://github.com/elastic/elastic-charts/commit/4186962a63ecb6fcee7d88abfcb98c6c3aa9666e)), closes [#832](https://github.com/elastic/elastic-charts/issues/832)

# [23.1.0](https://github.com/elastic/elastic-charts/compare/v23.0.1...v23.1.0) (2020-10-02)


### Features

* heatmap/swimlane chart type ([#831](https://github.com/elastic/elastic-charts/issues/831)) ([96f92b5](https://github.com/elastic/elastic-charts/commit/96f92b5684175c7d14b0c6f257c060cf60ab76fa)), closes [#752](https://github.com/elastic/elastic-charts/issues/752)

## [23.0.1](https://github.com/elastic/elastic-charts/compare/v23.0.0...v23.0.1) (2020-10-01)


### Bug Fixes

* legend item label for functional tests ([#843](https://github.com/elastic/elastic-charts/issues/843)) ([c2d3283](https://github.com/elastic/elastic-charts/commit/c2d3283bb4b577c4024d756562c0e3dc77c127ad))

# [23.0.0](https://github.com/elastic/elastic-charts/compare/v22.0.0...v23.0.0) (2020-09-30)


### Bug Fixes

* render continuous line/area between non-adjacent points ([#833](https://github.com/elastic/elastic-charts/issues/833)) ([9f9892b](https://github.com/elastic/elastic-charts/commit/9f9892b255e62f6d42f4119458a791a62d592986)), closes [#825](https://github.com/elastic/elastic-charts/issues/825)


### Features

* debug state flag added to chart status ([#834](https://github.com/elastic/elastic-charts/issues/834)) ([83919ff](https://github.com/elastic/elastic-charts/commit/83919ffe294257839d360b589ce10f405e04af5b))
* expose datum as part of GeometryValue ([#822](https://github.com/elastic/elastic-charts/issues/822)) ([dcd7077](https://github.com/elastic/elastic-charts/commit/dcd70777c2b6b8530b4518ebbac066e9f097594e))


### BREAKING CHANGES

* when rendering non-stacked line/area charts with a continuous x scale and no fit function,
the line/area between non-consecutive data points will be rendered as a continuous line/area without adding an uncertain dashed line/ semi-transparent area that connects the two, non-adjacent, points.

# [22.0.0](https://github.com/elastic/elastic-charts/compare/v21.3.2...v22.0.0) (2020-09-22)


### Bug Fixes

* breaking change in patch release of 21.1.1 ([d0ddc45](https://github.com/elastic/elastic-charts/commit/d0ddc45e2dbfb23bb1d8682b354b5de2b8476fce)), closes [#810](https://github.com/elastic/elastic-charts/issues/810)


### BREAKING CHANGES

* caused by changes in #810 see #830 for more info
* `TooltipValue.value` is now raw value and `TooltipValue.formattedValue` is now the
string formatted value.

## [21.3.2](https://github.com/elastic/elastic-charts/compare/v21.3.1...v21.3.2) (2020-09-21)


### Bug Fixes

* **axis:** style overrides not applied to axis dimensions ([#829](https://github.com/elastic/elastic-charts/issues/829)) ([62172c4](https://github.com/elastic/elastic-charts/commit/62172c4cd80cdcf06167a70ad8e875f5dd79bea4))

## [21.3.1](https://github.com/elastic/elastic-charts/compare/v21.3.0...v21.3.1) (2020-09-17)


### Bug Fixes

* line path with ordered xValues ([#824](https://github.com/elastic/elastic-charts/issues/824)) ([5a73a3a](https://github.com/elastic/elastic-charts/commit/5a73a3ad7049fc80a72f6b4a09c6404e8067bd9b))

# [21.3.0](https://github.com/elastic/elastic-charts/compare/v21.2.0...v21.3.0) (2020-09-16)


### Bug Fixes

* legend dark mode hover color ([#820](https://github.com/elastic/elastic-charts/issues/820)) ([5227b2e](https://github.com/elastic/elastic-charts/commit/5227b2e811379a941d0bc23bc3160867707177ce))


### Features

* cancel brush/click event with escape key ([#819](https://github.com/elastic/elastic-charts/issues/819)) ([b599d13](https://github.com/elastic/elastic-charts/commit/b599d133c64c05400715fc9368865fdd35969736))
* show crosshair for external pointer events ([#817](https://github.com/elastic/elastic-charts/issues/817)) ([f591a6a](https://github.com/elastic/elastic-charts/commit/f591a6a329c9297df9faf9bc7fde43eb13699500))

# [21.2.0](https://github.com/elastic/elastic-charts/compare/v21.1.2...v21.2.0) (2020-09-14)


### Features

* blind sorting option for vislib ([#813](https://github.com/elastic/elastic-charts/issues/813)) ([8afce43](https://github.com/elastic/elastic-charts/commit/8afce435c85eeff9ed7ee7b44a246f898f4050fb))
* order ordinal values by sum ([#814](https://github.com/elastic/elastic-charts/issues/814)) ([5b2758b](https://github.com/elastic/elastic-charts/commit/5b2758bb41fd3b89a51921b40373d5105eae4d4b))
* **series:** add simple mark formatter ([#775](https://github.com/elastic/elastic-charts/issues/775)) ([ab95284](https://github.com/elastic/elastic-charts/commit/ab95284dcaf20dae2c29653917e70fb3ce7960bc))

## [21.1.2](https://github.com/elastic/elastic-charts/compare/v21.1.1...v21.1.2) (2020-09-09)


### Bug Fixes

* remove unused redux dev middlewares ([#812](https://github.com/elastic/elastic-charts/issues/812)) ([b2679e7](https://github.com/elastic/elastic-charts/commit/b2679e7248ff0475b4267a3099c7afe1dfee67b6))

## [21.1.1](https://github.com/elastic/elastic-charts/compare/v21.1.0...v21.1.1) (2020-09-08)


### Bug Fixes

* build issues and tooltip formatting issues ([#810](https://github.com/elastic/elastic-charts/issues/810)) ([74d9ae0](https://github.com/elastic/elastic-charts/commit/74d9ae0d9425ce494cd15037f4d952eb2db167ab))

# [21.1.0](https://github.com/elastic/elastic-charts/compare/v21.0.1...v21.1.0) (2020-09-06)


### Bug Fixes

* **axis:** misaligned axis with rotated histogram bar charts ([#805](https://github.com/elastic/elastic-charts/issues/805)) ([6c454e1](https://github.com/elastic/elastic-charts/commit/6c454e10ece3f4cbaf1bacf06f5f2b832e9c32b0))


### Features

* **brush:** histogram brushing last values and rounding ([#801](https://github.com/elastic/elastic-charts/issues/801)) ([6d0319f](https://github.com/elastic/elastic-charts/commit/6d0319f1b0898360c004ec34844ac0b441d08b38))
* **tooltip:** series tick formatters ([#802](https://github.com/elastic/elastic-charts/issues/802)) ([fbcd92e](https://github.com/elastic/elastic-charts/commit/fbcd92e1ff4802c07561a9abf309cc88a26e8b5e))

## [21.0.1](https://github.com/elastic/elastic-charts/compare/v21.0.0...v21.0.1) (2020-08-18)


### Bug Fixes

* allow graceful error handling ([#779](https://github.com/elastic/elastic-charts/issues/779)) ([8183b32](https://github.com/elastic/elastic-charts/commit/8183b32f41bd9f5c0948393a4e5e05d1211cd74c)), closes [#776](https://github.com/elastic/elastic-charts/issues/776)

# [21.0.0](https://github.com/elastic/elastic-charts/compare/v20.0.2...v21.0.0) (2020-08-10)


### Bug Fixes

* update dep vulnerabilities, minimist and kind-of ([#763](https://github.com/elastic/elastic-charts/issues/763)) ([4455281](https://github.com/elastic/elastic-charts/commit/4455281bbc23bf13e8eccbdb4ab36168c1610c7f))
* **legend:** fix color anchor, add action context, fix action padding ([#774](https://github.com/elastic/elastic-charts/issues/774)) ([4590a22](https://github.com/elastic/elastic-charts/commit/4590a22c58359ffb13e977cb1dca854a01c3961b))
* **tooltip:** placement with left/top legends and single bars ([#771](https://github.com/elastic/elastic-charts/issues/771)) ([e576b26](https://github.com/elastic/elastic-charts/commit/e576b2610f882a490de645e1e702a33ccebb818d)), closes [#769](https://github.com/elastic/elastic-charts/issues/769) [#770](https://github.com/elastic/elastic-charts/issues/770)


### Features

* streamgraph and fit functions on stacked charts ([#751](https://github.com/elastic/elastic-charts/issues/751)) ([268fcc0](https://github.com/elastic/elastic-charts/commit/268fcc087578b17ae6575f08653ca3be01fb5801)), closes [#766](https://github.com/elastic/elastic-charts/issues/766) [#715](https://github.com/elastic/elastic-charts/issues/715) [#450](https://github.com/elastic/elastic-charts/issues/450)


### BREAKING CHANGES

* the first parameter of `PointStyleAccessor` and `BarStyleAccessor` callbacks is changed from `RawDataSeriesDatum` to `DataSeriesDatum`. `stackAsPercentage` prop is replaced by `stackMode` that accept one `StackMode`.

## [20.0.2](https://github.com/elastic/elastic-charts/compare/v20.0.1...v20.0.2) (2020-07-23)


### Bug Fixes

* **axis:** dual axis x positioning of bars ([#760](https://github.com/elastic/elastic-charts/issues/760)) ([71b49f8](https://github.com/elastic/elastic-charts/commit/71b49f87bc3ae5d09f0d2d45fdc6bdb67d61c5a4))
* **axis:** left axis sizing based on title padding ([#762](https://github.com/elastic/elastic-charts/issues/762)) ([3990589](https://github.com/elastic/elastic-charts/commit/399058939d164ca2c46652982c010a4dbfcd2628))

## [20.0.1](https://github.com/elastic/elastic-charts/compare/v20.0.0...v20.0.1) (2020-07-21)


### Bug Fixes

* custom domain error with fallback ordinal scale ([#757](https://github.com/elastic/elastic-charts/issues/757)) ([142c3df](https://github.com/elastic/elastic-charts/commit/142c3dfd15832d1dbbc923918c662b1a40d169a4)), closes [#756](https://github.com/elastic/elastic-charts/issues/756)

# [20.0.0](https://github.com/elastic/elastic-charts/compare/v19.9.1...v20.0.0) (2020-07-19)


### Features

* **axis:** improved axis styles ([#711](https://github.com/elastic/elastic-charts/issues/711)) ([3c46f9c](https://github.com/elastic/elastic-charts/commit/3c46f9c8c45a1375e4856fec7f53b85bbda4bae8)), closes [#714](https://github.com/elastic/elastic-charts/issues/714) [#312](https://github.com/elastic/elastic-charts/issues/312)


### BREAKING CHANGES

* **axis:** - `AxisSpec.gridLineStyle` => `AxisSpec.gridLine`
- `AxisSpec.gridLineStyle` => `AxisSpec.gridLine`
- `AxisSpec.tickLabelRotation` => `AxisStyle.tickLabel.rotation`
- `AxisSpec.tickPadding` => `AxisStyle.tickLine.padding`
- `AxisSpec.tickSize` => `AxisStyle.tickLine.size`
- `AxisStyle.tickLabelPadding` => `AxisStyle.tickLabel.padding`
- `GridLineConfig` => `GridLineStyle`
- `AxisSpec.style` => `RecursivePartial<AxisStyle>` (new `AxisStyle` type)
- `AxisConfig.axisLineStyle` => `AxisStyle.axisLine`
- `AxisConfig.axisTitleStyle` => `AxisStyle.axisTitle`
- `AxisConfig.tickLabelStyle` => `AxisStyle.tickLabel`
- `AxisConfig.tickLineStyle` => `AxisStyle.tickLine`
- `GridLineStyle` requires all properties
- deprecate `AxisSpec.showGridLines` in favor of `AxisSpec.gridLine.visible`

## [19.9.1](https://github.com/elastic/elastic-charts/compare/v19.9.0...v19.9.1) (2020-07-19)


### Bug Fixes

* correct bad breaking change merge ([3acc263](https://github.com/elastic/elastic-charts/commit/3acc263b1c1a7f6fed9f1820132abd656e3f153e))

# [19.9.0](https://github.com/elastic/elastic-charts/compare/v19.8.1...v19.9.0) (2020-07-17)


### Features

* **axis:** formatting different for label vs tooltip and legend ([#750](https://github.com/elastic/elastic-charts/issues/750)) ([daff503](https://github.com/elastic/elastic-charts/commit/daff5033cc979cb978227dcbf044f8ceb22568a9))
* **legend:** add legend item actions and margins ([#749](https://github.com/elastic/elastic-charts/issues/749)) ([8136dca](https://github.com/elastic/elastic-charts/commit/8136dcae91fc0f7e4ee0912d23713ff2bbe46fad)), closes [#717](https://github.com/elastic/elastic-charts/issues/717)

## [19.8.1](https://github.com/elastic/elastic-charts/compare/v19.8.0...v19.8.1) (2020-07-07)


### Bug Fixes

* **axes:** remove only consecutive duplicated ticks ([#742](https://github.com/elastic/elastic-charts/issues/742)) ([5038a63](https://github.com/elastic/elastic-charts/commit/5038a636f63ca7f649419e640d35b1b1c80f9b5a)), closes [#667](https://github.com/elastic/elastic-charts/issues/667)

# [19.8.0](https://github.com/elastic/elastic-charts/compare/v19.7.0...v19.8.0) (2020-07-06)


### Bug Fixes

* set uninitialized state when removeSpec action is called ([#739](https://github.com/elastic/elastic-charts/issues/739)) ([35b8caf](https://github.com/elastic/elastic-charts/commit/35b8caf52ea96979340102653f26aa7ffa069bc2)), closes [#723](https://github.com/elastic/elastic-charts/issues/723) [#738](https://github.com/elastic/elastic-charts/issues/738)


### Features

* **annotation:** enable marker positioning on LineAnnotation ([#737](https://github.com/elastic/elastic-charts/issues/737)) ([ab5e413](https://github.com/elastic/elastic-charts/commit/ab5e41378a7a26aca97565722439b618767609b6)), closes [#701](https://github.com/elastic/elastic-charts/issues/701)
* add custom annotation tooltip ([#727](https://github.com/elastic/elastic-charts/issues/727)) ([435c67c](https://github.com/elastic/elastic-charts/commit/435c67c2f873c15cd7509f81faed8adf0915208a))

# [19.7.0](https://github.com/elastic/elastic-charts/compare/v19.6.3...v19.7.0) (2020-06-30)


### Bug Fixes

* **partition:** linked label on a larger than 180 degree slice ([#726](https://github.com/elastic/elastic-charts/issues/726)) ([2504bbe](https://github.com/elastic/elastic-charts/commit/2504bbef966824b0d6aa30dae05d324cbd0208c9)), closes [#699](https://github.com/elastic/elastic-charts/issues/699)


### Features

* add domain padding ([#707](https://github.com/elastic/elastic-charts/issues/707)) ([15c78c1](https://github.com/elastic/elastic-charts/commit/15c78c145afbe2183a491908ebbcd91f490a141d)), closes [#706](https://github.com/elastic/elastic-charts/issues/706)

## [19.6.3](https://github.com/elastic/elastic-charts/compare/v19.6.2...v19.6.3) (2020-06-29)


### Bug Fixes

* move redux dev deps to optional deps ([#725](https://github.com/elastic/elastic-charts/issues/725)) ([df984cc](https://github.com/elastic/elastic-charts/commit/df984cccf0f087fe1dd14f38a867d8a2d95080b2))

## [19.6.2](https://github.com/elastic/elastic-charts/compare/v19.6.1...v19.6.2) (2020-06-29)


### Bug Fixes

* react/redux issue with specParser ([#723](https://github.com/elastic/elastic-charts/issues/723)) ([f9c29ec](https://github.com/elastic/elastic-charts/commit/f9c29ec7ec8b4d16c73e556f4ea6964548c78790)), closes [#720](https://github.com/elastic/elastic-charts/issues/720)

## [19.6.1](https://github.com/elastic/elastic-charts/compare/v19.6.0...v19.6.1) (2020-06-29)


### Bug Fixes

* background color dark mode issue ([#719](https://github.com/elastic/elastic-charts/issues/719)) ([40bb526](https://github.com/elastic/elastic-charts/commit/40bb5266b5acf1f80d147c30f6ebca52272f0bec))

# [19.6.0](https://github.com/elastic/elastic-charts/compare/v19.5.2...v19.6.0) (2020-06-24)


### Features

* show tooltip for external events ([#698](https://github.com/elastic/elastic-charts/issues/698)) ([cc31739](https://github.com/elastic/elastic-charts/commit/cc31739a2d2d5173ded3780f1d23890714fb61b3)), closes [#695](https://github.com/elastic/elastic-charts/issues/695)

## [19.5.2](https://github.com/elastic/elastic-charts/compare/v19.5.1...v19.5.2) (2020-06-16)


### Bug Fixes

* apply fixed positioning to hidden tooltip ([#716](https://github.com/elastic/elastic-charts/issues/716)) ([12b1135](https://github.com/elastic/elastic-charts/commit/12b1135fa6a965eda17a0235d2b639a19b19df54))

## [19.5.1](https://github.com/elastic/elastic-charts/compare/v19.5.0...v19.5.1) (2020-06-16)


### Bug Fixes

* graceful scale fallbacks and warnings ([#704](https://github.com/elastic/elastic-charts/issues/704)) ([ed49bbb](https://github.com/elastic/elastic-charts/commit/ed49bbbb5afd69a5d771fff29e9fc7742153d94e)), closes [#678](https://github.com/elastic/elastic-charts/issues/678)
* **axis:** rotated label positioning ([#709](https://github.com/elastic/elastic-charts/issues/709)) ([2e26430](https://github.com/elastic/elastic-charts/commit/2e264305b0427969e6ffd6bfd2a21a0200ddd004)), closes [#673](https://github.com/elastic/elastic-charts/issues/673)
* **tooltip:** popper scroll issue ([#712](https://github.com/elastic/elastic-charts/issues/712)) ([0c97c67](https://github.com/elastic/elastic-charts/commit/0c97c677af5133efa1017afa7141111667bf9d56))

# [19.5.0](https://github.com/elastic/elastic-charts/compare/v19.4.1...v19.5.0) (2020-06-15)


### Bug Fixes

* **tooltip:** show true opaque colors in tooltips ([#629](https://github.com/elastic/elastic-charts/issues/629)) ([23290be](https://github.com/elastic/elastic-charts/commit/23290be8d58a46cfe5b9144c54fc849fabcb6abc)), closes [#628](https://github.com/elastic/elastic-charts/issues/628)
* path of stacked area series with missing values ([#703](https://github.com/elastic/elastic-charts/issues/703)) ([2541180](https://github.com/elastic/elastic-charts/commit/2541180b1a477aa637120ce225c59e0f8cbd5aa4))
* remove double rendering ([#693](https://github.com/elastic/elastic-charts/issues/693)) ([ebf2748](https://github.com/elastic/elastic-charts/commit/ebf2748b47e098197b87fe43cc6ec452443207fb)), closes [#690](https://github.com/elastic/elastic-charts/issues/690)


### Features

* **partition:** add 4.5 contrast for text in partition slices ([#608](https://github.com/elastic/elastic-charts/issues/608)) ([eded2ac](https://github.com/elastic/elastic-charts/commit/eded2ac7da909a0bd279c7f38bb83d0b713a01be)), closes [#606](https://github.com/elastic/elastic-charts/issues/606)
* add screenshot functions to partition/goal ([#697](https://github.com/elastic/elastic-charts/issues/697)) ([5581c3c](https://github.com/elastic/elastic-charts/commit/5581c3c8fdc3730892402fa1c5cc2a068012eaf8))

## [19.4.1](https://github.com/elastic/elastic-charts/compare/v19.4.0...v19.4.1) (2020-06-01)


### Bug Fixes

* missing dash style in line annotation ([#692](https://github.com/elastic/elastic-charts/issues/692)) ([e2ba940](https://github.com/elastic/elastic-charts/commit/e2ba940f3e3483dd250879866d8d5c3e7e786e5b)), closes [#687](https://github.com/elastic/elastic-charts/issues/687)

# [19.4.0](https://github.com/elastic/elastic-charts/compare/v19.3.0...v19.4.0) (2020-05-28)


### Bug Fixes

* **partition:** consider legendMaxDepth on legend size ([#654](https://github.com/elastic/elastic-charts/issues/654)) ([9429dcf](https://github.com/elastic/elastic-charts/commit/9429dcff58678e82db142fcc6579dbea6d0f7450)), closes [#639](https://github.com/elastic/elastic-charts/issues/639)


### Features

* **partition:** enable grooves in all group layers ([#666](https://github.com/elastic/elastic-charts/issues/666)) ([f5b4767](https://github.com/elastic/elastic-charts/commit/f5b47675535949f0be8302106ab3842c49412e93))
* **partition:** linked text overflow avoidance ([#670](https://github.com/elastic/elastic-charts/issues/670)) ([b6e5911](https://github.com/elastic/elastic-charts/commit/b6e5911e55772aff0de3ccea947a794ec469abc6)), closes [#633](https://github.com/elastic/elastic-charts/issues/633)
* **partition:** monotonic font size scaling ([#681](https://github.com/elastic/elastic-charts/issues/681)) ([ea2489b](https://github.com/elastic/elastic-charts/commit/ea2489b23bd3f66222dab042ea5b5b7e377e2809)), closes [#661](https://github.com/elastic/elastic-charts/issues/661)
* **tooltip:** improve positioning with popperjs ([#651](https://github.com/elastic/elastic-charts/issues/651)) ([6512950](https://github.com/elastic/elastic-charts/commit/651295080b557409c95e1e4ab371bfdc94e86acc)), closes [#596](https://github.com/elastic/elastic-charts/issues/596)

# [19.3.0](https://github.com/elastic/elastic-charts/compare/v19.2.0...v19.3.0) (2020-05-08)


### Bug Fixes

* build/type issue with DataGenerator ([#671](https://github.com/elastic/elastic-charts/issues/671)) ([86dd2b1](https://github.com/elastic/elastic-charts/commit/86dd2b1a859d6cd122902a801fe419cbbeb852ec))


### Features

* **partition:** linked text maximum length config ([#665](https://github.com/elastic/elastic-charts/issues/665)) ([7166e42](https://github.com/elastic/elastic-charts/commit/7166e422d95a60fb4685116a71a6acb87d7961cf))

# [19.2.0](https://github.com/elastic/elastic-charts/compare/v19.1.2...v19.2.0) (2020-05-05)


### Features

* **partition:** treemap padding ([#660](https://github.com/elastic/elastic-charts/issues/660)) ([ed1e8be](https://github.com/elastic/elastic-charts/commit/ed1e8be1c870c748fee432a643039b4ba93b2c62))

## [19.1.2](https://github.com/elastic/elastic-charts/compare/v19.1.1...v19.1.2) (2020-05-04)


### Bug Fixes

* **partition:** elimination of zero values ([#658](https://github.com/elastic/elastic-charts/issues/658)) ([9ee67dc](https://github.com/elastic/elastic-charts/commit/9ee67dc89851e268edf79016915b973bcea6bd98)), closes [#642](https://github.com/elastic/elastic-charts/issues/642)

## [19.1.1](https://github.com/elastic/elastic-charts/compare/v19.1.0...v19.1.1) (2020-04-30)


### Bug Fixes

* render charts without series ([#657](https://github.com/elastic/elastic-charts/issues/657)) ([0c0af01](https://github.com/elastic/elastic-charts/commit/0c0af01413b00734bd3dfa13dbc3aa7571ee4240))

# [19.1.0](https://github.com/elastic/elastic-charts/compare/v19.0.0...v19.1.0) (2020-04-30)


### Features

* **partition:** treemap group text in grooves ([#652](https://github.com/elastic/elastic-charts/issues/652)) ([304dd48](https://github.com/elastic/elastic-charts/commit/304dd481b0c3195022d2a1b26887901ba56c07e0))

# [19.0.0](https://github.com/elastic/elastic-charts/compare/v18.4.2...v19.0.0) (2020-04-28)


### Bug Fixes

* tooltip container scroll issue ([#647](https://github.com/elastic/elastic-charts/issues/647)) ([f411771](https://github.com/elastic/elastic-charts/commit/f4117717690f4086805f002afb85c3a4b0d2fe22))
* **annotations:** fix alignment at the edges ([#641](https://github.com/elastic/elastic-charts/issues/641)) ([43c5a59](https://github.com/elastic/elastic-charts/commit/43c5a59e3862b6191537b73fc0ca604e79fbc992)), closes [#586](https://github.com/elastic/elastic-charts/issues/586)


### Features

* shift click legend items & partition legend hover ([#648](https://github.com/elastic/elastic-charts/issues/648)) ([ed91744](https://github.com/elastic/elastic-charts/commit/ed9174471e31df77234ea05f307b0dce79722bea))
* **brush:** add multi axis brushing ([#625](https://github.com/elastic/elastic-charts/issues/625)) ([9e49534](https://github.com/elastic/elastic-charts/commit/9e4953474db37d33f8a19dfb1ff1a5528b0f6d54)), closes [#587](https://github.com/elastic/elastic-charts/issues/587) [#620](https://github.com/elastic/elastic-charts/issues/620)


### BREAKING CHANGES

* **brush:** The type used by the `BrushEndListener` is now in the following form `{ x?: [number, number]; y?: Array<{ groupId: GroupId; values: [number,
number]; }> }` where `x` contains an array of `[min, max]` values, and the  `y` property is an optional array of objects, containing the `GroupId` and the values of the brush for that specific axis.
* **annotations:** In the rectangular annotation, the y0 parameter of the coordinates now refers to the minimum value and the y1 value refers to the maximum value of the y domain.

## [18.4.2](https://github.com/elastic/elastic-charts/compare/v18.4.1...v18.4.2) (2020-04-24)


### Bug Fixes

* tickFormat called on mark value ([#649](https://github.com/elastic/elastic-charts/issues/649)) ([daf6a82](https://github.com/elastic/elastic-charts/commit/daf6a82aee5c9ea4031daa1ab992d10955caedb0))

## [18.4.1](https://github.com/elastic/elastic-charts/compare/v18.4.0...v18.4.1) (2020-04-22)


### Bug Fixes

* type issue pulling from src/index ([#645](https://github.com/elastic/elastic-charts/issues/645)) ([3f3a996](https://github.com/elastic/elastic-charts/commit/3f3a996d4bfb5c1b1db9d7a4650b637f6afe996c))

# [18.4.0](https://github.com/elastic/elastic-charts/compare/v18.3.0...v18.4.0) (2020-04-22)


### Bug Fixes

* **partition:** single slice wrong text positioning ([#643](https://github.com/elastic/elastic-charts/issues/643)) ([6298d36](https://github.com/elastic/elastic-charts/commit/6298d36dda5349ccc91b6fb410064545e6c4becb)), closes [#637](https://github.com/elastic/elastic-charts/issues/637)
* **treemap:** align onElementClick parameters to sunburst ([#636](https://github.com/elastic/elastic-charts/issues/636)) ([2c1d224](https://github.com/elastic/elastic-charts/commit/2c1d22460b7152bd5fd9c035ee522e6fb4eedd53)), closes [#624](https://github.com/elastic/elastic-charts/issues/624)


### Features

* allow colorVariant option for series specific color styles ([#630](https://github.com/elastic/elastic-charts/issues/630)) ([e5a206d](https://github.com/elastic/elastic-charts/commit/e5a206d13c1b1bdfa2d42b6f9c11652040de5971))
* **series:** BubbleSeries (alpha) and markSizeAccessor ([#559](https://github.com/elastic/elastic-charts/issues/559)) ([3aa235e](https://github.com/elastic/elastic-charts/commit/3aa235e12cd843b0799282585de5795aa329296b))

# [18.3.0](https://github.com/elastic/elastic-charts/compare/v18.2.2...v18.3.0) (2020-04-15)


### Bug Fixes

* remove series with undefined splitSeriesAccessor values ([#627](https://github.com/elastic/elastic-charts/issues/627)) ([59f0f6e](https://github.com/elastic/elastic-charts/commit/59f0f6e718afad29abc9e761f169ca49ec2148b3))


### Features

* gauge, goal and bullet graph (alpha) ([#614](https://github.com/elastic/elastic-charts/issues/614)) ([5669178](https://github.com/elastic/elastic-charts/commit/5669178416859369d801a4360b542e3bd452dffa))
* **partition:** add legend and highlighters ([#616](https://github.com/elastic/elastic-charts/issues/616)) ([6a4247e](https://github.com/elastic/elastic-charts/commit/6a4247ebc77fd95ce34557eac128b0d57a659a9e)), closes [#486](https://github.com/elastic/elastic-charts/issues/486) [#532](https://github.com/elastic/elastic-charts/issues/532)

## [18.2.2](https://github.com/elastic/elastic-charts/compare/v18.2.1...v18.2.2) (2020-04-09)


### Bug Fixes

* stacked percentage with zero values ([#622](https://github.com/elastic/elastic-charts/issues/622)) ([77c3146](https://github.com/elastic/elastic-charts/commit/77c314652cf5d84da536a167d0b15eb0385b2107))

## [18.2.1](https://github.com/elastic/elastic-charts/compare/v18.2.0...v18.2.1) (2020-04-07)


### Bug Fixes

* stack as percentage with 0 or null values ([#618](https://github.com/elastic/elastic-charts/issues/618)) ([7be1f63](https://github.com/elastic/elastic-charts/commit/7be1f63af3449a2ba220f228ba21187e87ce2467)), closes [#617](https://github.com/elastic/elastic-charts/issues/617)

# [18.2.0](https://github.com/elastic/elastic-charts/compare/v18.1.0...v18.2.0) (2020-03-26)


### Bug Fixes

* **line_annotation:** keep the spec in state after chart rerender ([#605](https://github.com/elastic/elastic-charts/issues/605)) ([43c13f1](https://github.com/elastic/elastic-charts/commit/43c13f1a9652e9a50b7f9cf25a84a7a772695f81)), closes [#604](https://github.com/elastic/elastic-charts/issues/604)


### Features

* **partition:** stroke configuration and linked label value font format ([#602](https://github.com/elastic/elastic-charts/issues/602)) ([7dce0a3](https://github.com/elastic/elastic-charts/commit/7dce0a3598d4c4e59087bcb086a5d520381485cb))

# [18.1.0](https://github.com/elastic/elastic-charts/compare/v18.0.0...v18.1.0) (2020-03-18)


### Bug Fixes

* add unicorn eslint as dev dependency ([#591](https://github.com/elastic/elastic-charts/issues/591)) ([30fd07c](https://github.com/elastic/elastic-charts/commit/30fd07c15399551ae12441145744b3fd6f617bd7))


### Features

* remove duplicate tick labels from axis ([#577](https://github.com/elastic/elastic-charts/issues/577)) ([e8c89ec](https://github.com/elastic/elastic-charts/commit/e8c89ec0588f829acdbdf169a223f96dffb067a2)), closes [#445](https://github.com/elastic/elastic-charts/issues/445)
* **api:** cleanup exposed types ([#593](https://github.com/elastic/elastic-charts/issues/593)) ([544b7cc](https://github.com/elastic/elastic-charts/commit/544b7cc3825d9f277b4c4cacf51c10cb96fbc142))
* **partition:** general sunburst via slice show control ([#592](https://github.com/elastic/elastic-charts/issues/592)) ([5e6a30b](https://github.com/elastic/elastic-charts/commit/5e6a30b41f38d1991c991c7003da3f6bf5bc0575))

# [18.0.0](https://github.com/elastic/elastic-charts/compare/v17.1.1...v18.0.0) (2020-03-17)


### Code Refactoring

* clean up TS types ([#554](https://github.com/elastic/elastic-charts/issues/554)) ([22f7635](https://github.com/elastic/elastic-charts/commit/22f7635f0a1c8564b8f59b311079224f500522b9)), closes [#547](https://github.com/elastic/elastic-charts/issues/547) [#547](https://github.com/elastic/elastic-charts/issues/547)
* decouple tooltip from XY chart ([#553](https://github.com/elastic/elastic-charts/issues/553)) ([e70792e](https://github.com/elastic/elastic-charts/commit/e70792ea437c851dafc8f0f58e2faf3fb03143ae)), closes [#246](https://github.com/elastic/elastic-charts/issues/246)


### Features

* cleaner color API on SeriesSpec ([#571](https://github.com/elastic/elastic-charts/issues/571)) ([f769f7c](https://github.com/elastic/elastic-charts/commit/f769f7c0a7e15fab793f84befbf0661e3deb75c6))
* **legend:** allow color picker component render prop ([#545](https://github.com/elastic/elastic-charts/issues/545)) ([90f4b95](https://github.com/elastic/elastic-charts/commit/90f4b95656ac2704693c87211a3c63993251ead4))
* **partition:** add element click, over and out events ([#578](https://github.com/elastic/elastic-charts/issues/578)) ([103df02](https://github.com/elastic/elastic-charts/commit/103df026981c396eae16c406d77731ad3fe4bcec))
* **partition:** add tooltip ([#544](https://github.com/elastic/elastic-charts/issues/544)) ([6bf9a69](https://github.com/elastic/elastic-charts/commit/6bf9a69b12d3075330a5728b7bdb4443e6244985)), closes [#246](https://github.com/elastic/elastic-charts/issues/246)
* percentage display in partitioning charts ([#558](https://github.com/elastic/elastic-charts/issues/558)) ([d6aa8d7](https://github.com/elastic/elastic-charts/commit/d6aa8d72db1411a1967a37b5940020dc2f8037ec))
* specify series name with a function on SeriesSpec ([#539](https://github.com/elastic/elastic-charts/issues/539)) ([358455a](https://github.com/elastic/elastic-charts/commit/358455aea73591965401f43ae4bfa4525c3d2953))
* xAccessor can be a function accessor ([#574](https://github.com/elastic/elastic-charts/issues/574)) ([bcc3d63](https://github.com/elastic/elastic-charts/commit/bcc3d63bb126dc1714a8bf2a94d072a0c92a0231))


### BREAKING CHANGES

* The `getSpecId`, `getGroupId`, `getAxisId` and `getAnnotationId` are no longer available. Use a simple `string` instead.
* `customSeriesColors` prop on `SeriesSpec` is now `color`. The `CustomSeriesColors` type is  replaced with `SeriesColorAccessor`.
* Remove `customSubSeriesName` prop on series specs in favor of cleaner api using just the `name` prop on `SeriesSpec`. The types `SeriesStringPredicate`, `SubSeriesStringPredicate` have been removed.
* the `SeriesIdentifier` type is generalized into a simplified object with two values in common: `specId` and `key`. A specialized `XYChartSeriesIdentifier` extends now the base `SeriesIdentifier`. The `SettingsSpec` prop `showLegendDisplayValue` is renamed to `showLegendExtra` and its default value is now `false` hiding the current/last value on the legend by default.

## [17.1.1](https://github.com/elastic/elastic-charts/compare/v17.1.0...v17.1.1) (2020-02-21)


### Bug Fixes

* redux connect memo issue related to spec upserting ([#563](https://github.com/elastic/elastic-charts/issues/563)) ([f3a05f1](https://github.com/elastic/elastic-charts/commit/f3a05f1abe35d690e433a8ad9b6f5a999a7da7fe))

# [17.1.0](https://github.com/elastic/elastic-charts/compare/v17.0.3...v17.1.0) (2020-02-12)


### Features

* remove konva and add native canvas rendering ([#540](https://github.com/elastic/elastic-charts/issues/540)) ([08a4d5d](https://github.com/elastic/elastic-charts/commit/08a4d5dca21c98236c645e09548f918f088a6e96))

## [17.0.3](https://github.com/elastic/elastic-charts/compare/v17.0.2...v17.0.3) (2020-02-10)


### Bug Fixes

* **ie11:** replace fast-deep-equal with an internal copy IE11 safe ([#542](https://github.com/elastic/elastic-charts/issues/542)) ([2a02d7d](https://github.com/elastic/elastic-charts/commit/2a02d7d0692c6c43f6fce529bd9555552aeb093a))

## [17.0.2](https://github.com/elastic/elastic-charts/compare/v17.0.1...v17.0.2) (2020-02-05)


### Bug Fixes

* empty domain error for ordinal x scale ([#536](https://github.com/elastic/elastic-charts/issues/536)) ([ce4e84f](https://github.com/elastic/elastic-charts/commit/ce4e84fac8b51861cde377303ecaf9038611158b))

## [17.0.1](https://github.com/elastic/elastic-charts/compare/v17.0.0...v17.0.1) (2020-02-05)


### Bug Fixes

* replace PureComponent with shouldComponentUpdate ([#534](https://github.com/elastic/elastic-charts/issues/534)) ([5043725](https://github.com/elastic/elastic-charts/commit/5043725b7581bfea2340ca5323743d9fe03a4e19))

# [17.0.0](https://github.com/elastic/elastic-charts/compare/v16.2.1...v17.0.0) (2020-01-30)


### Bug Fixes

* **brush:** rotate brush on rotated charts ([#528](https://github.com/elastic/elastic-charts/issues/528)) ([985ac21](https://github.com/elastic/elastic-charts/commit/985ac21e1e6669d812dd9cf6c688668eee06aa65)), closes [#527](https://github.com/elastic/elastic-charts/issues/527)


### Features

* text improvements ([#524](https://github.com/elastic/elastic-charts/issues/524)) ([6e61700](https://github.com/elastic/elastic-charts/commit/6e617007f953e23cb96bef610f7ea2ce5a81161a))
* **listeners:** add seriesIdentifiers to element listeners ([#525](https://github.com/elastic/elastic-charts/issues/525)) ([027d008](https://github.com/elastic/elastic-charts/commit/027d008b79996ac465b062fd9b7ecace10a3080f)), closes [#419](https://github.com/elastic/elastic-charts/issues/419) [#505](https://github.com/elastic/elastic-charts/issues/505)


### BREAKING CHANGES

* **listeners:** the `onElementOver` and the `onElementClick` are now called with
`Array<[GeometryValue, SeriesIdentifier]>` instead of `Array<GeometryValue>`
* renames in `Partition` charts— `Layers`: `fillLabel.formatter`->`fillLabel.valueFormatter`; type `FillLabel`-> `FillLabelConfig`

Non-breaking changes:

* feat: the values in linked labels are rendered, just like they have been in the sectors (formerly, the value could optionally be put in the link label accessor itself)

* feat: font styling is possible separately for values: `valueFormatter` configs

* test: opacity decrease example; coloring examples

* feat: hierarchical data (`parent`, `sortIndex`) is made available to accessors (see stories, helpful with eg. coloring)

* refactor: tighter types; other code improvements

## [16.2.1](https://github.com/elastic/elastic-charts/compare/v16.2.0...v16.2.1) (2020-01-23)


### Bug Fixes

* try to get canvas post mounting ([#521](https://github.com/elastic/elastic-charts/issues/521)) ([141f465](https://github.com/elastic/elastic-charts/commit/141f4658acd3047eb6652ef3324fcfe2b9e42903))

# [16.2.0](https://github.com/elastic/elastic-charts/compare/v16.1.0...v16.2.0) (2020-01-21)


### Features

* implement treemap, sunburst, pie and donut charts ([#493](https://github.com/elastic/elastic-charts/issues/493)) ([e4de627](https://github.com/elastic/elastic-charts/commit/e4de6275d63250a92ca8a07c6f7e6420ba3da73a))

# [16.1.0](https://github.com/elastic/elastic-charts/compare/v16.0.2...v16.1.0) (2020-01-08)


### Features

* add domain fitting ([#510](https://github.com/elastic/elastic-charts/issues/510)) ([fefe728](https://github.com/elastic/elastic-charts/commit/fefe728da21be72a38855f719bce19588319fb71))

## [16.0.2](https://github.com/elastic/elastic-charts/compare/v16.0.1...v16.0.2) (2020-01-03)


### Bug Fixes

* add utility-types as dependency ([#509](https://github.com/elastic/elastic-charts/issues/509)) ([26b4d9c](https://github.com/elastic/elastic-charts/commit/26b4d9c545bcd139b3e0850ce48c83051db1bd3b))

## [16.0.1](https://github.com/elastic/elastic-charts/compare/v16.0.0...v16.0.1) (2020-01-03)


### Bug Fixes

* **specs:** shows a chart message without series specified ([#506](https://github.com/elastic/elastic-charts/issues/506)) ([ba1a67b](https://github.com/elastic/elastic-charts/commit/ba1a67b5c59396fa38dc87516487403e53d30405))

# [16.0.0](https://github.com/elastic/elastic-charts/compare/v15.0.5...v16.0.0) (2020-01-02)


### Bug Fixes

* **external pointer:** avoid recursive-loops on pointer events ([#503](https://github.com/elastic/elastic-charts/issues/503)) ([c170f0d](https://github.com/elastic/elastic-charts/commit/c170f0ddfade407d4c2b2e7d1b1d72a8142b59b8)), closes [#504](https://github.com/elastic/elastic-charts/issues/504)


### BREAKING CHANGES

* **external pointer:** The `onCursorUpdate` Settings property is changed to a more generic
`onPointerUpdate`. The same apply for the event type `CursorEvent` that is now `PointerEvent` and can assume a `PointerOverEvent` or `PointOutEvent` shape (see TS types)

## [15.0.5](https://github.com/elastic/elastic-charts/compare/v15.0.4...v15.0.5) (2019-12-12)


### Bug Fixes

* render stacked bar with stringified values ([#488](https://github.com/elastic/elastic-charts/issues/488)) ([811ee90](https://github.com/elastic/elastic-charts/commit/811ee900280706933fa33ce72b52be89684b5188)), closes [#487](https://github.com/elastic/elastic-charts/issues/487)

## [15.0.4](https://github.com/elastic/elastic-charts/compare/v15.0.3...v15.0.4) (2019-12-12)


### Bug Fixes

* **highlighter:** clip path unique id ([#490](https://github.com/elastic/elastic-charts/issues/490)) ([dc93624](https://github.com/elastic/elastic-charts/commit/dc936242546bb39ce973fd6dddbb60538f8be5d6)), closes [#489](https://github.com/elastic/elastic-charts/issues/489)

## [15.0.3](https://github.com/elastic/elastic-charts/compare/v15.0.2...v15.0.3) (2019-12-05)


### Bug Fixes

* **highlighter:** hide it when tooltip type is None ([#482](https://github.com/elastic/elastic-charts/issues/482)) ([6032c29](https://github.com/elastic/elastic-charts/commit/6032c29194d0e507fe4a9d36bf63b4b78692d271)), closes [#478](https://github.com/elastic/elastic-charts/issues/478) [#479](https://github.com/elastic/elastic-charts/issues/479)

## [15.0.2](https://github.com/elastic/elastic-charts/compare/v15.0.1...v15.0.2) (2019-12-05)


### Bug Fixes

* **crosshair:** hide horizontal line when the pointer is outside chart ([#484](https://github.com/elastic/elastic-charts/issues/484)) ([654d929](https://github.com/elastic/elastic-charts/commit/654d9296215d183e7433edab65a99122143b56e7)), closes [#483](https://github.com/elastic/elastic-charts/issues/483)

## [15.0.1](https://github.com/elastic/elastic-charts/compare/v15.0.0...v15.0.1) (2019-12-02)


### Bug Fixes

* redux dev tools config ([#465](https://github.com/elastic/elastic-charts/issues/465)) ([89d5364](https://github.com/elastic/elastic-charts/commit/89d53648f254983efc11f5f9a1636554aba31dd4))

# [15.0.0](https://github.com/elastic/elastic-charts/compare/v14.2.0...v15.0.0) (2019-12-02)


### Code Refactoring

* series identifications throughout library ([#419](https://github.com/elastic/elastic-charts/issues/419)) ([66a48ff](https://github.com/elastic/elastic-charts/commit/66a48ff170cec4e6d48b9219dee53a9f36b8d23d))
* use redux in favour of mobx ([#281](https://github.com/elastic/elastic-charts/issues/281)) ([cd34716](https://github.com/elastic/elastic-charts/commit/cd34716c744598b8fd56a1d4d6b2eda43437d365))


### BREAKING CHANGES

* `GeometryId` is now `SeriesIdentifier`. `customSeriesColors` prop on `SeriesSpec` which used to take a `CustomSeriesColorsMap`, now expects a `CustomSeriesColors` type. `LegendItemListener` now passes the `SeriesIdentifier` type as the first callback argument.
* `SpecId`,`AxisId`, `AnnotationId` types are down-casted to a `string` type. The `getSpecId`, `getAxisId` and `getAnnotationId` methods still exist and but return just the same passed string until deprecated in a future version. The spec ids, previously `id`, `axisId`,`annotationId` etc are now aligned to use the same prop name: `id`. The chart rendering status `data-ech-render-complete` and `data-ech-render-count` is no more at the root level of the `echChart` div, but on its child element: `echChartStatus`. The `Spec` has two new private properties called `chartType` and `specType`.

# [14.2.0](https://github.com/elastic/elastic-charts/compare/v14.1.0...v14.2.0) (2019-11-25)


### Features

* add PNG export ([#451](https://github.com/elastic/elastic-charts/issues/451)) ([e844687](https://github.com/elastic/elastic-charts/commit/e844687)), closes [#82](https://github.com/elastic/elastic-charts/issues/82)

# [14.1.0](https://github.com/elastic/elastic-charts/compare/v14.0.0...v14.1.0) (2019-11-13)


### Features

* fit functions for null y1 values ([#416](https://github.com/elastic/elastic-charts/issues/416)) ([e083755](https://github.com/elastic/elastic-charts/commit/e083755)), closes [#450](https://github.com/elastic/elastic-charts/issues/450) [#388](https://github.com/elastic/elastic-charts/issues/388)

# [14.0.0](https://github.com/elastic/elastic-charts/compare/v13.6.0...v14.0.0) (2019-11-11)


### Code Refactoring

* **typings:** prepare for upgrade TS to 3.7 ([#402](https://github.com/elastic/elastic-charts/issues/402)) ([e2700de](https://github.com/elastic/elastic-charts/commit/e2700de))


### BREAKING CHANGES

* **typings:** We have a few exported styles, used in the Theme that are changed: SharedGeometryStyle to SharedGeometryStateStyle and GeometryStyle to GeometryStateStyle

# [13.6.0](https://github.com/elastic/elastic-charts/compare/v13.5.12...v13.6.0) (2019-11-01)


### Features

* **bar_spec:** min bar render height ([#443](https://github.com/elastic/elastic-charts/issues/443)) ([dac21c1](https://github.com/elastic/elastic-charts/commit/dac21c1))

## [13.5.12](https://github.com/elastic/elastic-charts/compare/v13.5.11...v13.5.12) (2019-10-31)


### Bug Fixes

* clip bar highlighter edges  ([#447](https://github.com/elastic/elastic-charts/issues/447)) ([c9fc3e2](https://github.com/elastic/elastic-charts/commit/c9fc3e2))

## [13.5.11](https://github.com/elastic/elastic-charts/compare/v13.5.10...v13.5.11) (2019-10-31)


### Bug Fixes

* **tooltip:** render tooltip on portal to avoid hidden overflows ([#418](https://github.com/elastic/elastic-charts/issues/418)) ([1c00e23](https://github.com/elastic/elastic-charts/commit/1c00e23)), closes [#375](https://github.com/elastic/elastic-charts/issues/375)

## [13.5.10](https://github.com/elastic/elastic-charts/compare/v13.5.9...v13.5.10) (2019-10-31)


### Bug Fixes

* **legend:** disable fade of other charts when hiding an item ([#446](https://github.com/elastic/elastic-charts/issues/446)) ([ff4e097](https://github.com/elastic/elastic-charts/commit/ff4e097))

## [13.5.9](https://github.com/elastic/elastic-charts/compare/v13.5.8...v13.5.9) (2019-10-25)


### Bug Fixes

* initial legend sizing issue ([#441](https://github.com/elastic/elastic-charts/issues/441)) ([64b9f83](https://github.com/elastic/elastic-charts/commit/64b9f83)), closes [#367](https://github.com/elastic/elastic-charts/issues/367)

## [13.5.8](https://github.com/elastic/elastic-charts/compare/v13.5.7...v13.5.8) (2019-10-25)


### Bug Fixes

* xDomain to exclude undefined values ([#440](https://github.com/elastic/elastic-charts/issues/440)) ([6389356](https://github.com/elastic/elastic-charts/commit/6389356))

## [13.5.7](https://github.com/elastic/elastic-charts/compare/v13.5.6...v13.5.7) (2019-10-23)


### Bug Fixes

* switch to momentjs to handle timezones ([#436](https://github.com/elastic/elastic-charts/issues/436)) ([a9f98c8](https://github.com/elastic/elastic-charts/commit/a9f98c8))

## [13.5.6](https://github.com/elastic/elastic-charts/compare/v13.5.5...v13.5.6) (2019-10-22)


### Bug Fixes

* **tickformatter:** add timeZone to tickFormatter ([#430](https://github.com/elastic/elastic-charts/issues/430)) ([6256d4d](https://github.com/elastic/elastic-charts/commit/6256d4d)), closes [#427](https://github.com/elastic/elastic-charts/issues/427)

## [13.5.5](https://github.com/elastic/elastic-charts/compare/v13.5.4...v13.5.5) (2019-10-22)


### Bug Fixes

* resize observer loop limit exception ([#429](https://github.com/elastic/elastic-charts/issues/429)) ([5243ef3](https://github.com/elastic/elastic-charts/commit/5243ef3))

## [13.5.4](https://github.com/elastic/elastic-charts/compare/v13.5.3...v13.5.4) (2019-10-17)


### Bug Fixes

* seedrandom dependency ([#424](https://github.com/elastic/elastic-charts/issues/424)) ([2670d28](https://github.com/elastic/elastic-charts/commit/2670d28))

## [13.5.3](https://github.com/elastic/elastic-charts/compare/v13.5.2...v13.5.3) (2019-10-17)


### Bug Fixes

* align series names on split series configuration ([#421](https://github.com/elastic/elastic-charts/issues/421)) ([bbecbcc](https://github.com/elastic/elastic-charts/commit/bbecbcc)), closes [#420](https://github.com/elastic/elastic-charts/issues/420)

## [13.5.2](https://github.com/elastic/elastic-charts/compare/v13.5.1...v13.5.2) (2019-10-10)


### Bug Fixes

* handle null y0 values on y log scale rendering ([#413](https://github.com/elastic/elastic-charts/issues/413)) ([5731c10](https://github.com/elastic/elastic-charts/commit/5731c10))

## [13.5.1](https://github.com/elastic/elastic-charts/compare/v13.5.0...v13.5.1) (2019-10-09)


### Bug Fixes

* mixing bars with line or area series breaks legend toggle ([#410](https://github.com/elastic/elastic-charts/issues/410)) ([57c0e3c](https://github.com/elastic/elastic-charts/commit/57c0e3c)), closes [#399](https://github.com/elastic/elastic-charts/issues/399)

# [13.5.0](https://github.com/elastic/elastic-charts/compare/v13.4.1...v13.5.0) (2019-10-09)


### Features

* **data:** fill datasets with zeros with missing points when stacked ([#409](https://github.com/elastic/elastic-charts/issues/409)) ([ef84fd4](https://github.com/elastic/elastic-charts/commit/ef84fd4)), closes [#388](https://github.com/elastic/elastic-charts/issues/388)

## [13.4.1](https://github.com/elastic/elastic-charts/compare/v13.4.0...v13.4.1) (2019-10-09)


### Bug Fixes

* **tooltip:** fix spec naming ([#412](https://github.com/elastic/elastic-charts/issues/412)) ([3690cca](https://github.com/elastic/elastic-charts/commit/3690cca)), closes [#411](https://github.com/elastic/elastic-charts/issues/411)

# [13.4.0](https://github.com/elastic/elastic-charts/compare/v13.3.0...v13.4.0) (2019-10-07)


### Features

* banded legend values ([#398](https://github.com/elastic/elastic-charts/issues/398) & [#408](https://github.com/elastic/elastic-charts/issues/408)) ([5c35a4d](https://github.com/elastic/elastic-charts/commit/5c35a4d)), closes [#162](https://github.com/elastic/elastic-charts/issues/162)

# [13.3.0](https://github.com/elastic/elastic-charts/compare/v13.2.0...v13.3.0) (2019-10-02)


### Features

* **tooltip:** tooltip label format for upper/lower banded area series ([#391](https://github.com/elastic/elastic-charts/issues/391)) ([dfd5d7b](https://github.com/elastic/elastic-charts/commit/dfd5d7b)), closes [#162](https://github.com/elastic/elastic-charts/issues/162)

# [13.2.0](https://github.com/elastic/elastic-charts/compare/v13.1.1...v13.2.0) (2019-10-01)


### Features

* **style:** point style overrides ([#385](https://github.com/elastic/elastic-charts/issues/385)) ([0f587d0](https://github.com/elastic/elastic-charts/commit/0f587d0))

## [13.1.1](https://github.com/elastic/elastic-charts/compare/v13.1.0...v13.1.1) (2019-09-28)


### Bug Fixes

* **rendering:** out-of-domain rendering of points/bars/lines/areas ([#395](https://github.com/elastic/elastic-charts/issues/395)) ([b6fee52](https://github.com/elastic/elastic-charts/commit/b6fee52)), closes [#386](https://github.com/elastic/elastic-charts/issues/386)

# [13.1.0](https://github.com/elastic/elastic-charts/compare/v13.0.1...v13.1.0) (2019-09-27)


### Features

* **axis:** add option for integer only axis ticks ([#389](https://github.com/elastic/elastic-charts/issues/389)) ([4fcfe3c](https://github.com/elastic/elastic-charts/commit/4fcfe3c)), closes [#387](https://github.com/elastic/elastic-charts/issues/387)

## [13.0.1](https://github.com/elastic/elastic-charts/compare/v13.0.0...v13.0.1) (2019-09-27)


### Bug Fixes

* x-scale for linear band charts ([#384](https://github.com/elastic/elastic-charts/issues/384)) ([daa3b55](https://github.com/elastic/elastic-charts/commit/daa3b55))

# [13.0.0](https://github.com/elastic/elastic-charts/compare/v12.1.0...v13.0.0) (2019-09-19)


### Features

* **axis:** add visibility to tick style ([#374](https://github.com/elastic/elastic-charts/issues/374)) ([265a6bb](https://github.com/elastic/elastic-charts/commit/265a6bb)), closes [#330](https://github.com/elastic/elastic-charts/issues/330)


### BREAKING CHANGES

* **axis:** `theme.axes.tickLineStyle.visible` is now required (default base is `true`)

# [12.1.0](https://github.com/elastic/elastic-charts/compare/v12.0.2...v12.1.0) (2019-09-19)


### Features

* **axis:** option to hide duplicate axes ([#370](https://github.com/elastic/elastic-charts/issues/370)) ([ada2ddc](https://github.com/elastic/elastic-charts/commit/ada2ddc)), closes [#368](https://github.com/elastic/elastic-charts/issues/368)

## [12.0.2](https://github.com/elastic/elastic-charts/compare/v12.0.1...v12.0.2) (2019-09-16)


### Bug Fixes

* **reactive_chart:** fix order of instantiation of onBrushEnd callback ([#376](https://github.com/elastic/elastic-charts/issues/376)) ([527d68d](https://github.com/elastic/elastic-charts/commit/527d68d)), closes [#360](https://github.com/elastic/elastic-charts/issues/360)

## [12.0.1](https://github.com/elastic/elastic-charts/compare/v12.0.0...v12.0.1) (2019-09-12)


### Bug Fixes

* **theme:** fix grid position check ([#373](https://github.com/elastic/elastic-charts/issues/373)) ([af4805f](https://github.com/elastic/elastic-charts/commit/af4805f)), closes [#372](https://github.com/elastic/elastic-charts/issues/372)

# [12.0.0](https://github.com/elastic/elastic-charts/compare/v11.2.0...v12.0.0) (2019-09-11)


### Features

* **theme:** add gridLineStyle to AxisConfig ([#257](https://github.com/elastic/elastic-charts/issues/257)) ([97dd812](https://github.com/elastic/elastic-charts/commit/97dd812)), closes [#237](https://github.com/elastic/elastic-charts/issues/237)


### BREAKING CHANGES

* **theme:** Added `GridLineStyle` to `Theme` (`theme.axes.gridLineStyle.horizontal` and `theme.axes.gridLineStyle.vertical`)

* add gridLineStyle to AxisConfig
* add chartTheme vs axisSpec
* add gridLineStyle for theme or spec
* merge gridLineConfig from theme with axisSpec
* add visible key to GridLineConfig
* specify theme styling per axis in story
* add gridLineStyle theme with horiz and vert

# [11.2.0](https://github.com/elastic/elastic-charts/compare/v11.1.2...v11.2.0) (2019-09-04)


### Features

* **chart_state:** add render change event ([#365](https://github.com/elastic/elastic-charts/issues/365)) ([521889b](https://github.com/elastic/elastic-charts/commit/521889b))

## [11.1.2](https://github.com/elastic/elastic-charts/compare/v11.1.1...v11.1.2) (2019-08-30)


### Bug Fixes

* **engines:** update node engine ([#363](https://github.com/elastic/elastic-charts/issues/363)) ([7fcd98c](https://github.com/elastic/elastic-charts/commit/7fcd98c)), closes [#359](https://github.com/elastic/elastic-charts/issues/359)

## [11.1.1](https://github.com/elastic/elastic-charts/compare/v11.1.0...v11.1.1) (2019-08-28)


### Bug Fixes

* **annotations:** markers shown in empty chart ([#358](https://github.com/elastic/elastic-charts/issues/358)) ([8dbf54e](https://github.com/elastic/elastic-charts/commit/8dbf54e)), closes [#357](https://github.com/elastic/elastic-charts/issues/357)

# [11.1.0](https://github.com/elastic/elastic-charts/compare/v11.0.5...v11.1.0) (2019-08-27)


### Features

* add prop to set debounce time, lower default ([#356](https://github.com/elastic/elastic-charts/issues/356)) ([38e41e0](https://github.com/elastic/elastic-charts/commit/38e41e0))

## [11.0.5](https://github.com/elastic/elastic-charts/compare/v11.0.4...v11.0.5) (2019-08-27)


### Bug Fixes

* clip overflowing rect/lines/areas ([#355](https://github.com/elastic/elastic-charts/issues/355)) ([3ff7379](https://github.com/elastic/elastic-charts/commit/3ff7379)), closes [#354](https://github.com/elastic/elastic-charts/issues/354)

## [11.0.4](https://github.com/elastic/elastic-charts/compare/v11.0.3...v11.0.4) (2019-08-27)


### Bug Fixes

* **crosshair:** limit the width of the cursor band on edges ([#353](https://github.com/elastic/elastic-charts/issues/353)) ([1177e59](https://github.com/elastic/elastic-charts/commit/1177e59)), closes [#352](https://github.com/elastic/elastic-charts/issues/352)

## [11.0.3](https://github.com/elastic/elastic-charts/compare/v11.0.2...v11.0.3) (2019-08-26)


### Bug Fixes

* **vertical_cursor:** fix tooltip and external events for 1st datapoint ([#349](https://github.com/elastic/elastic-charts/issues/349)) ([5c5b8d4](https://github.com/elastic/elastic-charts/commit/5c5b8d4))

## [11.0.2](https://github.com/elastic/elastic-charts/compare/v11.0.1...v11.0.2) (2019-08-26)


### Bug Fixes

* better theme defaults for light and dark themes ([#340](https://github.com/elastic/elastic-charts/issues/340)) ([693cdc1](https://github.com/elastic/elastic-charts/commit/693cdc1))

## [11.0.1](https://github.com/elastic/elastic-charts/compare/v11.0.0...v11.0.1) (2019-08-26)


### Bug Fixes

* **renderer:** stroke opacity ([#335](https://github.com/elastic/elastic-charts/issues/335)) ([d8c8459](https://github.com/elastic/elastic-charts/commit/d8c8459))

# [11.0.0](https://github.com/elastic/elastic-charts/compare/v10.3.1...v11.0.0) (2019-08-26)


### Bug Fixes

* **histogram:** fix overflowing annotation with single value ([#343](https://github.com/elastic/elastic-charts/issues/343)) ([2268f04](https://github.com/elastic/elastic-charts/commit/2268f04)), closes [#342](https://github.com/elastic/elastic-charts/issues/342) [#341](https://github.com/elastic/elastic-charts/issues/341)


### BREAKING CHANGES

* **histogram:** The current coordinate configuration of a rect annotation were inverted. This commit now reverse them: a rect coordinate with only the x0 value will cover from the x0 value to the end of the domain, a rect coordinate with only the x1 value will cover the interval from the beginning of the domain till the x1 value.

## [10.3.1](https://github.com/elastic/elastic-charts/compare/v10.3.0...v10.3.1) (2019-08-26)


### Bug Fixes

* **scales:** bisect correctly on continuous scales ([#346](https://github.com/elastic/elastic-charts/issues/346)) ([5112208](https://github.com/elastic/elastic-charts/commit/5112208)), closes [#227](https://github.com/elastic/elastic-charts/issues/227) [#221](https://github.com/elastic/elastic-charts/issues/221)

# [10.3.0](https://github.com/elastic/elastic-charts/compare/v10.2.0...v10.3.0) (2019-08-26)


### Features

* compute global y domain on multiple groups ([#348](https://github.com/elastic/elastic-charts/issues/348)) ([5ab46ca](https://github.com/elastic/elastic-charts/commit/5ab46ca)), closes [#169](https://github.com/elastic/elastic-charts/issues/169) [#185](https://github.com/elastic/elastic-charts/issues/185)

# [10.2.0](https://github.com/elastic/elastic-charts/compare/v10.1.1...v10.2.0) (2019-08-23)


### Features

* **theme:** multiple-partials ([#345](https://github.com/elastic/elastic-charts/issues/345)) ([82da5de](https://github.com/elastic/elastic-charts/commit/82da5de)), closes [#344](https://github.com/elastic/elastic-charts/issues/344)

## [10.1.1](https://github.com/elastic/elastic-charts/compare/v10.1.0...v10.1.1) (2019-08-22)


### Bug Fixes

* **crosshair:** disable band when chart is empty ([#338](https://github.com/elastic/elastic-charts/issues/338)) ([3bd0c43](https://github.com/elastic/elastic-charts/commit/3bd0c43)), closes [#337](https://github.com/elastic/elastic-charts/issues/337)

# [10.1.0](https://github.com/elastic/elastic-charts/compare/v10.0.1...v10.1.0) (2019-08-22)


### Features

* hide tooltip when over line annotation ([#339](https://github.com/elastic/elastic-charts/issues/339)) ([bef1fc7](https://github.com/elastic/elastic-charts/commit/bef1fc7)), closes [#324](https://github.com/elastic/elastic-charts/issues/324)

## [10.0.1](https://github.com/elastic/elastic-charts/compare/v10.0.0...v10.0.1) (2019-08-21)


### Bug Fixes

* default theme ([#336](https://github.com/elastic/elastic-charts/issues/336)) ([2edadb2](https://github.com/elastic/elastic-charts/commit/2edadb2))

# [10.0.0](https://github.com/elastic/elastic-charts/compare/v9.2.1...v10.0.0) (2019-08-21)


### Bug Fixes

* **tooltip:** ie11 flex sizing ([#334](https://github.com/elastic/elastic-charts/issues/334)) ([abaa472](https://github.com/elastic/elastic-charts/commit/abaa472)), closes [#332](https://github.com/elastic/elastic-charts/issues/332)
* decuple brush cursor from chart rendering ([#331](https://github.com/elastic/elastic-charts/issues/331)) ([789f85a](https://github.com/elastic/elastic-charts/commit/789f85a)), closes [elastic/kibana#36517](https://github.com/elastic/kibana/issues/36517)
* remove clippings from chart geometries ([#320](https://github.com/elastic/elastic-charts/issues/320)) ([ed6d0e5](https://github.com/elastic/elastic-charts/commit/ed6d0e5)), closes [#20](https://github.com/elastic/elastic-charts/issues/20)


### Features

* auto legend resize ([#316](https://github.com/elastic/elastic-charts/issues/316)) ([659d27e](https://github.com/elastic/elastic-charts/commit/659d27e)), closes [#268](https://github.com/elastic/elastic-charts/issues/268)
* customize number of axis ticks ([#319](https://github.com/elastic/elastic-charts/issues/319)) ([2b838d7](https://github.com/elastic/elastic-charts/commit/2b838d7))
* **theme:** base theme prop ([#333](https://github.com/elastic/elastic-charts/issues/333)) ([a9ff5e1](https://github.com/elastic/elastic-charts/commit/a9ff5e1)), closes [#292](https://github.com/elastic/elastic-charts/issues/292)


### BREAKING CHANGES

* **theme:** remove `baseThemeType` prop on `Settings` component and `BaseThemeTypes` type.
* `theme.legend.spacingBuffer` added to `Theme` type. Controls the width buffer between the legend label and value.

## [9.2.1](https://github.com/elastic/elastic-charts/compare/v9.2.0...v9.2.1) (2019-08-20)


### Bug Fixes

* **tooltip:** fix duplicate key warning for band area charts ([#327](https://github.com/elastic/elastic-charts/issues/327)) ([0ca1884](https://github.com/elastic/elastic-charts/commit/0ca1884)), closes [#326](https://github.com/elastic/elastic-charts/issues/326)

# [9.2.0](https://github.com/elastic/elastic-charts/compare/v9.1.1...v9.2.0) (2019-08-19)


### Bug Fixes

* reduce opacity for points when hovering over legend items ([#322](https://github.com/elastic/elastic-charts/issues/322)) ([196341b](https://github.com/elastic/elastic-charts/commit/196341b)), closes [#291](https://github.com/elastic/elastic-charts/issues/291)


### Features

* add chart size type overrides ([#317](https://github.com/elastic/elastic-charts/issues/317)) ([b8dc9e1](https://github.com/elastic/elastic-charts/commit/b8dc9e1)), closes [#177](https://github.com/elastic/elastic-charts/issues/177)

## [9.1.1](https://github.com/elastic/elastic-charts/compare/v9.1.0...v9.1.1) (2019-08-16)


### Bug Fixes

* **axis:** limit chart dimensions to avoid axis labels overflow ([#314](https://github.com/elastic/elastic-charts/issues/314)) ([5751ce0](https://github.com/elastic/elastic-charts/commit/5751ce0))

# [9.1.0](https://github.com/elastic/elastic-charts/compare/v9.0.4...v9.1.0) (2019-08-14)


### Features

* add cursor sync mechanism ([#304](https://github.com/elastic/elastic-charts/issues/304)) ([c8c1d9d](https://github.com/elastic/elastic-charts/commit/c8c1d9d))

## [9.0.4](https://github.com/elastic/elastic-charts/compare/v9.0.3...v9.0.4) (2019-08-13)


### Bug Fixes

* **legend:** item hideInLegend prop ([#307](https://github.com/elastic/elastic-charts/issues/307)) ([3aa5ca3](https://github.com/elastic/elastic-charts/commit/3aa5ca3)), closes [#306](https://github.com/elastic/elastic-charts/issues/306)

## [9.0.3](https://github.com/elastic/elastic-charts/compare/v9.0.2...v9.0.3) (2019-08-13)


### Bug Fixes

* zIndex order for areas, lines and points ([#290](https://github.com/elastic/elastic-charts/issues/290)) ([6a4c1b1](https://github.com/elastic/elastic-charts/commit/6a4c1b1)), closes [#287](https://github.com/elastic/elastic-charts/issues/287)

## [9.0.2](https://github.com/elastic/elastic-charts/compare/v9.0.1...v9.0.2) (2019-08-12)


### Bug Fixes

* shift bars independently from the specs order ([#302](https://github.com/elastic/elastic-charts/issues/302)) ([1cd934d](https://github.com/elastic/elastic-charts/commit/1cd934d))

## [9.0.1](https://github.com/elastic/elastic-charts/compare/v9.0.0...v9.0.1) (2019-08-07)


### Bug Fixes

* handle split series with group value to 0 ([#289](https://github.com/elastic/elastic-charts/issues/289)) ([0f2217e](https://github.com/elastic/elastic-charts/commit/0f2217e)), closes [#288](https://github.com/elastic/elastic-charts/issues/288)

# [9.0.0](https://github.com/elastic/elastic-charts/compare/v8.1.8...v9.0.0) (2019-08-05)


### Features

* **bar_chart:** color/style override accessor ([#271](https://github.com/elastic/elastic-charts/issues/271)) ([7634f5c](https://github.com/elastic/elastic-charts/commit/7634f5c)), closes [#216](https://github.com/elastic/elastic-charts/issues/216)


### BREAKING CHANGES

* **bar_chart:** colorAccessors removed from YBasicSeriesSpec (aka for all series) which had acted similarly to a split accessor.

## [8.1.8](https://github.com/elastic/elastic-charts/compare/v8.1.7...v8.1.8) (2019-08-05)


### Bug Fixes

* **tooltip:** fix tooltip formatting for rotated charts ([#285](https://github.com/elastic/elastic-charts/issues/285)) ([651edd1](https://github.com/elastic/elastic-charts/commit/651edd1)), closes [#273](https://github.com/elastic/elastic-charts/issues/273)

## [8.1.7](https://github.com/elastic/elastic-charts/compare/v8.1.6...v8.1.7) (2019-08-05)


### Bug Fixes

* **tooltip:** fix overflow for long series names ([#274](https://github.com/elastic/elastic-charts/issues/274)) ([717486f](https://github.com/elastic/elastic-charts/commit/717486f)), closes [#270](https://github.com/elastic/elastic-charts/issues/270)

## [8.1.6](https://github.com/elastic/elastic-charts/compare/v8.1.5...v8.1.6) (2019-08-05)


### Bug Fixes

* **types:** export missing types ([#283](https://github.com/elastic/elastic-charts/issues/283)) ([7c475af](https://github.com/elastic/elastic-charts/commit/7c475af))

## [8.1.5](https://github.com/elastic/elastic-charts/compare/v8.1.4...v8.1.5) (2019-08-02)


### Bug Fixes

* disable tooltip when details or custom content is null ([#280](https://github.com/elastic/elastic-charts/issues/280)) ([4d78fdc](https://github.com/elastic/elastic-charts/commit/4d78fdc))

## [8.1.4](https://github.com/elastic/elastic-charts/compare/v8.1.3...v8.1.4) (2019-08-01)


### Bug Fixes

* **theme:** restore original point radius values ([#276](https://github.com/elastic/elastic-charts/issues/276)) ([16f789a](https://github.com/elastic/elastic-charts/commit/16f789a))

## [8.1.3](https://github.com/elastic/elastic-charts/compare/v8.1.2...v8.1.3) (2019-07-30)


### Bug Fixes

* update EUI, storybook and add autoprefixer ([#267](https://github.com/elastic/elastic-charts/issues/267)) ([f70e084](https://github.com/elastic/elastic-charts/commit/f70e084)), closes [#249](https://github.com/elastic/elastic-charts/issues/249)

## [8.1.2](https://github.com/elastic/elastic-charts/compare/v8.1.1...v8.1.2) (2019-07-24)


### Bug Fixes

* export GeometryValue so onElementClick callbacks can be typed ([#272](https://github.com/elastic/elastic-charts/issues/272)) ([8ed5d11](https://github.com/elastic/elastic-charts/commit/8ed5d11))

## [8.1.1](https://github.com/elastic/elastic-charts/compare/v8.1.0...v8.1.1) (2019-07-24)


### Bug Fixes

* handle chart click as mouseUp to prevent click while brushing ([#269](https://github.com/elastic/elastic-charts/issues/269)) ([7881b8d](https://github.com/elastic/elastic-charts/commit/7881b8d))

# [8.1.0](https://github.com/elastic/elastic-charts/compare/v8.0.2...v8.1.0) (2019-07-22)


### Features

* display empty chart status when no series is selected  ([f1505df](https://github.com/elastic/elastic-charts/commit/f1505df)), closes [#102](https://github.com/elastic/elastic-charts/issues/102)

## [8.0.2](https://github.com/elastic/elastic-charts/compare/v8.0.1...v8.0.2) (2019-07-17)


### Bug Fixes

* adjust domain & range for single value histogram ([#265](https://github.com/elastic/elastic-charts/issues/265)) ([3f1358e](https://github.com/elastic/elastic-charts/commit/3f1358e))

## [8.0.1](https://github.com/elastic/elastic-charts/compare/v8.0.0...v8.0.1) (2019-07-15)


### Bug Fixes

* position tooltip within chart with single value xScale ([#259](https://github.com/elastic/elastic-charts/issues/259)) ([f458bc9](https://github.com/elastic/elastic-charts/commit/f458bc9))

# [8.0.0](https://github.com/elastic/elastic-charts/compare/v7.2.1...v8.0.0) (2019-07-15)


### Code Refactoring

* **legend:** remove visibility button ([#252](https://github.com/elastic/elastic-charts/issues/252)) ([90a1ba7](https://github.com/elastic/elastic-charts/commit/90a1ba7))


### Features

* **style:** allow fill and stroke overrides ([#258](https://github.com/elastic/elastic-charts/issues/258)) ([99c5e9f](https://github.com/elastic/elastic-charts/commit/99c5e9f))


### BREAKING CHANGES

* **style:** `LineStyle`, `AreaStyle` and `BarSeriesStyle` types differs on the optional values.
`stroke` and `fill` on the theme or specific series style now override the computed series color.

* **legend:** the `onLegendItemClick` click handler is no longer applied when clicking on the title. Instead a simple visibility change is applied.

## [7.2.1](https://github.com/elastic/elastic-charts/compare/v7.2.0...v7.2.1) (2019-07-10)


### Bug Fixes

* **last_value:** compute last value for non stacked series ([#261](https://github.com/elastic/elastic-charts/issues/261)) ([803c34e](https://github.com/elastic/elastic-charts/commit/803c34e))

# [7.2.0](https://github.com/elastic/elastic-charts/compare/v7.1.0...v7.2.0) (2019-07-05)


### Bug Fixes

* **ticks:** fill in additional ticks for histogram ([#251](https://github.com/elastic/elastic-charts/issues/251)) ([af92736](https://github.com/elastic/elastic-charts/commit/af92736))


### Features

* **series:** stack series in percentage mode ([#250](https://github.com/elastic/elastic-charts/issues/250)) ([1bfb430](https://github.com/elastic/elastic-charts/commit/1bfb430)), closes [#222](https://github.com/elastic/elastic-charts/issues/222)

# [7.1.0](https://github.com/elastic/elastic-charts/compare/v7.0.2...v7.1.0) (2019-07-03)


### Features

* **axis:** add tickLabelPadding prop ([#217](https://github.com/elastic/elastic-charts/issues/217)) ([4d40936](https://github.com/elastic/elastic-charts/commit/4d40936)), closes [#94](https://github.com/elastic/elastic-charts/issues/94)

## [7.0.2](https://github.com/elastic/elastic-charts/compare/v7.0.1...v7.0.2) (2019-07-03)


### Bug Fixes

* **theme:** merge optional params ([#256](https://github.com/elastic/elastic-charts/issues/256)) ([9cd660c](https://github.com/elastic/elastic-charts/commit/9cd660c)), closes [#253](https://github.com/elastic/elastic-charts/issues/253)

## [7.0.1](https://github.com/elastic/elastic-charts/compare/v7.0.0...v7.0.1) (2019-06-25)


### Bug Fixes

* type error with RecursivePartial ([#248](https://github.com/elastic/elastic-charts/issues/248)) ([f2b90df](https://github.com/elastic/elastic-charts/commit/f2b90df))

# [7.0.0](https://github.com/elastic/elastic-charts/compare/v6.3.0...v7.0.0) (2019-06-24)


### Features

* **annotation:** simplify custom tooltip function ([#247](https://github.com/elastic/elastic-charts/issues/247)) ([982bc63](https://github.com/elastic/elastic-charts/commit/982bc63))


### BREAKING CHANGES

* **annotation:** this changes the type signature of `RectAnnotation.renderTooltip?` from `(position, details) => JSX.Element` to `(details) => JSX.Element`.  This allows the user to pass in a custom element without having to do the heavy lifting of writing the container positioning styles themselves.

# [6.3.0](https://github.com/elastic/elastic-charts/compare/v6.2.0...v6.3.0) (2019-06-20)


### Features

* **theme:** allow recursive partial theme ([#239](https://github.com/elastic/elastic-charts/issues/239)) ([d8144ee](https://github.com/elastic/elastic-charts/commit/d8144ee)), closes [#201](https://github.com/elastic/elastic-charts/issues/201)

# [6.2.0](https://github.com/elastic/elastic-charts/compare/v6.1.0...v6.2.0) (2019-06-19)


### Features

* add minInterval option for custom xDomain ([#240](https://github.com/elastic/elastic-charts/issues/240)) ([27f14a0](https://github.com/elastic/elastic-charts/commit/27f14a0))

# [6.1.0](https://github.com/elastic/elastic-charts/compare/v6.0.1...v6.1.0) (2019-06-19)


### Features

* **brush:** show crosshair cursor when brush enabled  ([#243](https://github.com/elastic/elastic-charts/issues/243)) ([0b44b87](https://github.com/elastic/elastic-charts/commit/0b44b87))

## [6.0.1](https://github.com/elastic/elastic-charts/compare/v6.0.0...v6.0.1) (2019-06-14)


### Bug Fixes

* **line_annotation:** use scaleAndValidate for line annotations ([#236](https://github.com/elastic/elastic-charts/issues/236)) ([48b180a](https://github.com/elastic/elastic-charts/commit/48b180a))

# [6.0.0](https://github.com/elastic/elastic-charts/compare/v5.2.0...v6.0.0) (2019-06-13)


### Features

* **tooltip:** add custom headerFormatter ([#233](https://github.com/elastic/elastic-charts/issues/233)) ([bd181b5](https://github.com/elastic/elastic-charts/commit/bd181b5))


### BREAKING CHANGES

* **tooltip:** Previously, you could define `tooltipType` and `tooltipSnap` props in a Settings component; this commit removes these from `SettingsSpecProps` and instead there is a single `tooltip` prop which can accept either a `TooltipType` or a full `TooltipProps` object which may include `type`, `snap`, and/or `headerFormattter` for formatting the header.

# [5.2.0](https://github.com/elastic/elastic-charts/compare/v5.1.0...v5.2.0) (2019-06-12)


### Features

* **scss:** export the theme as SCSS file ([#231](https://github.com/elastic/elastic-charts/issues/231)) ([ebae6ab](https://github.com/elastic/elastic-charts/commit/ebae6ab))

# [5.1.0](https://github.com/elastic/elastic-charts/compare/v5.0.0...v5.1.0) (2019-06-11)


### Features

* add histogram mode ([#218](https://github.com/elastic/elastic-charts/issues/218)) ([b418b67](https://github.com/elastic/elastic-charts/commit/b418b67))

# [5.0.0](https://github.com/elastic/elastic-charts/compare/v4.2.9...v5.0.0) (2019-06-10)


### Bug Fixes

* **css:** remove dependency on EUI components and use only EUI styles ([#208](https://github.com/elastic/elastic-charts/issues/208)) ([122fade](https://github.com/elastic/elastic-charts/commit/122fade))


### BREAKING CHANGES

* **css:** EUI components are removed from this library. The single chart `style.css` stylesheet is now replaced by a `theme_only_light.css` or `theme_only_dark.css` file that brings in all the required styling for chart, tooltip and legends. `theme_light.css` and `theme_dark.css` styles include also a reset CSS style

## [4.2.9](https://github.com/elastic/elastic-charts/compare/v4.2.8...v4.2.9) (2019-06-07)


### Bug Fixes

* **chart_resizer:** debounce resize only after initial render ([#229](https://github.com/elastic/elastic-charts/issues/229)) ([96d3fd6](https://github.com/elastic/elastic-charts/commit/96d3fd6)), closes [#109](https://github.com/elastic/elastic-charts/issues/109)

## [4.2.8](https://github.com/elastic/elastic-charts/compare/v4.2.7...v4.2.8) (2019-06-06)


### Bug Fixes

* **crosshair:** adjust band position for rotation ([#220](https://github.com/elastic/elastic-charts/issues/220)) ([ac02021](https://github.com/elastic/elastic-charts/commit/ac02021))

## [4.2.7](https://github.com/elastic/elastic-charts/compare/v4.2.6...v4.2.7) (2019-06-05)


### Bug Fixes

* **axis_title:** remove whitespace with empty axis title ([#226](https://github.com/elastic/elastic-charts/issues/226)) ([74198dc](https://github.com/elastic/elastic-charts/commit/74198dc)), closes [#225](https://github.com/elastic/elastic-charts/issues/225)

## [4.2.6](https://github.com/elastic/elastic-charts/compare/v4.2.5...v4.2.6) (2019-05-21)


### Bug Fixes

* **build:** compile module resolution in commonjs ([#214](https://github.com/elastic/elastic-charts/issues/214)) ([29e2a34](https://github.com/elastic/elastic-charts/commit/29e2a34))

## [4.2.5](https://github.com/elastic/elastic-charts/compare/v4.2.4...v4.2.5) (2019-05-21)


### Bug Fixes

* **build:** change build target to ES5 ([#211](https://github.com/elastic/elastic-charts/issues/211)) ([39b727e](https://github.com/elastic/elastic-charts/commit/39b727e))

## [4.2.4](https://github.com/elastic/elastic-charts/compare/v4.2.3...v4.2.4) (2019-05-21)


### Bug Fixes

* **eui:** generate css without EUI classes ([#210](https://github.com/elastic/elastic-charts/issues/210)) ([776387b](https://github.com/elastic/elastic-charts/commit/776387b))

## [4.2.3](https://github.com/elastic/elastic-charts/compare/v4.2.2...v4.2.3) (2019-05-20)


### Bug Fixes

* **legend:** avoid expanding label on click ([#209](https://github.com/elastic/elastic-charts/issues/209)) ([22cad8e](https://github.com/elastic/elastic-charts/commit/22cad8e))

## [4.2.2](https://github.com/elastic/elastic-charts/compare/v4.2.1...v4.2.2) (2019-05-20)


### Bug Fixes

* **ie11:** fix deps and layout compatibility issues on IE11 ([9555e2a](https://github.com/elastic/elastic-charts/commit/9555e2a)), closes [#184](https://github.com/elastic/elastic-charts/issues/184)

## [4.2.1](https://github.com/elastic/elastic-charts/compare/v4.2.0...v4.2.1) (2019-05-09)


### Bug Fixes

* **eui:** update EUI dependency to 11.0.0 ([#206](https://github.com/elastic/elastic-charts/issues/206)) ([24779cb](https://github.com/elastic/elastic-charts/commit/24779cb))

# [4.2.0](https://github.com/elastic/elastic-charts/compare/v4.1.0...v4.2.0) (2019-05-06)


### Features

* **rect_annotation:** add RectAnnotation type ([#180](https://github.com/elastic/elastic-charts/issues/180)) ([b339318](https://github.com/elastic/elastic-charts/commit/b339318))

# [4.1.0](https://github.com/elastic/elastic-charts/compare/v4.0.2...v4.1.0) (2019-05-04)


### Features

* add option to toggle value labels on bar charts ([#182](https://github.com/elastic/elastic-charts/issues/182)) ([6d8ec0e](https://github.com/elastic/elastic-charts/commit/6d8ec0e))

## [4.0.2](https://github.com/elastic/elastic-charts/compare/v4.0.1...v4.0.2) (2019-05-03)


### Bug Fixes

* **scales:** improve ticks for time domains spanning a DST switch ([#204](https://github.com/elastic/elastic-charts/issues/204)) ([2713336](https://github.com/elastic/elastic-charts/commit/2713336))

## [4.0.1](https://github.com/elastic/elastic-charts/compare/v4.0.0...v4.0.1) (2019-05-02)


### Bug Fixes

* **scales:** use bisect to handle invertWithStep ([#200](https://github.com/elastic/elastic-charts/issues/200)) ([f971d05](https://github.com/elastic/elastic-charts/commit/f971d05)), closes [#195](https://github.com/elastic/elastic-charts/issues/195) [#183](https://github.com/elastic/elastic-charts/issues/183)

# [4.0.0](https://github.com/elastic/elastic-charts/compare/v3.11.4...v4.0.0) (2019-04-28)


### Features

* **scales:** add paddings between bars ([#190](https://github.com/elastic/elastic-charts/issues/190)) ([e2e4a33](https://github.com/elastic/elastic-charts/commit/e2e4a33))


### BREAKING CHANGES

* **scales:** the `ScalesConfig` type of the theme is changed from `{ordinal:{padding: number}}` to `{barsPadding: number}`

## [3.11.4](https://github.com/elastic/elastic-charts/compare/v3.11.3...v3.11.4) (2019-04-26)


### Bug Fixes

* **bars:** remove border visibility based on bar width ([#192](https://github.com/elastic/elastic-charts/issues/192)) ([a270bab](https://github.com/elastic/elastic-charts/commit/a270bab)), closes [#189](https://github.com/elastic/elastic-charts/issues/189)

## [3.11.3](https://github.com/elastic/elastic-charts/compare/v3.11.2...v3.11.3) (2019-04-24)


### Bug Fixes

* merge multi-group indexed geometry ([#187](https://github.com/elastic/elastic-charts/issues/187)) ([8047c29](https://github.com/elastic/elastic-charts/commit/8047c29)), closes [#186](https://github.com/elastic/elastic-charts/issues/186)

## [3.11.2](https://github.com/elastic/elastic-charts/compare/v3.11.1...v3.11.2) (2019-04-16)


### Bug Fixes

* cleanup example prop default values ([#173](https://github.com/elastic/elastic-charts/issues/173)) ([ab19df0](https://github.com/elastic/elastic-charts/commit/ab19df0))

## [3.11.1](https://github.com/elastic/elastic-charts/compare/v3.11.0...v3.11.1) (2019-04-16)


### Bug Fixes

* apply transform.x to area & line geometries ([#172](https://github.com/elastic/elastic-charts/issues/172)) ([da4f07f](https://github.com/elastic/elastic-charts/commit/da4f07f))

# [3.11.0](https://github.com/elastic/elastic-charts/compare/v3.10.2...v3.11.0) (2019-04-16)


### Bug Fixes

* remove old specs with changed ids ([#167](https://github.com/elastic/elastic-charts/issues/167)) ([6c4f705](https://github.com/elastic/elastic-charts/commit/6c4f705))


### Features

* allow individual series styling ([#170](https://github.com/elastic/elastic-charts/issues/170)) ([c780d98](https://github.com/elastic/elastic-charts/commit/c780d98))

## [3.10.2](https://github.com/elastic/elastic-charts/compare/v3.10.1...v3.10.2) (2019-04-12)


### Bug Fixes

* **exports:** fix missing exports for annotations ([#166](https://github.com/elastic/elastic-charts/issues/166)) ([fe28afb](https://github.com/elastic/elastic-charts/commit/fe28afb))

## [3.10.1](https://github.com/elastic/elastic-charts/compare/v3.10.0...v3.10.1) (2019-04-11)


### Bug Fixes

* temporary disable animation ([#164](https://github.com/elastic/elastic-charts/issues/164)) ([80b3231](https://github.com/elastic/elastic-charts/commit/80b3231)), closes [#89](https://github.com/elastic/elastic-charts/issues/89) [#41](https://github.com/elastic/elastic-charts/issues/41) [#161](https://github.com/elastic/elastic-charts/issues/161)
* temporary disable animation ([#164](https://github.com/elastic/elastic-charts/issues/164)) ([c53c8a6](https://github.com/elastic/elastic-charts/commit/c53c8a6)), closes [#89](https://github.com/elastic/elastic-charts/issues/89) [#41](https://github.com/elastic/elastic-charts/issues/41) [#161](https://github.com/elastic/elastic-charts/issues/161)

# [3.10.0](https://github.com/elastic/elastic-charts/compare/v3.9.0...v3.10.0) (2019-04-11)


### Features

* add band area chart ([#157](https://github.com/elastic/elastic-charts/issues/157)) ([a9307ef](https://github.com/elastic/elastic-charts/commit/a9307ef)), closes [#144](https://github.com/elastic/elastic-charts/issues/144)

# [3.9.0](https://github.com/elastic/elastic-charts/compare/v3.8.0...v3.9.0) (2019-04-10)


### Features

* **legend:** display series value (dependent on hover) & sort in legend ([#155](https://github.com/elastic/elastic-charts/issues/155)) ([78af858](https://github.com/elastic/elastic-charts/commit/78af858))

# [3.8.0](https://github.com/elastic/elastic-charts/compare/v3.7.2...v3.8.0) (2019-04-08)


### Features

* **line_annotation:** add hideLines and hideTooltips props to spec ([#154](https://github.com/elastic/elastic-charts/issues/154)) ([ba806b1](https://github.com/elastic/elastic-charts/commit/ba806b1))

## [3.7.2](https://github.com/elastic/elastic-charts/compare/v3.7.1...v3.7.2) (2019-04-08)


### Bug Fixes

* **timescale:** consider timezone on axis ticks ([#151](https://github.com/elastic/elastic-charts/issues/151)) ([d860c97](https://github.com/elastic/elastic-charts/commit/d860c97)), closes [#130](https://github.com/elastic/elastic-charts/issues/130)

## [3.7.1](https://github.com/elastic/elastic-charts/compare/v3.7.0...v3.7.1) (2019-04-05)


### Bug Fixes

* **domain:** set domain bounds dependent on negative/positive values ([#149](https://github.com/elastic/elastic-charts/issues/149)) ([5b16be6](https://github.com/elastic/elastic-charts/commit/5b16be6))

# [3.7.0](https://github.com/elastic/elastic-charts/compare/v3.6.0...v3.7.0) (2019-04-04)


### Features

* **legend:** hide legend item if hideLegendItem on series spec is true ([#147](https://github.com/elastic/elastic-charts/issues/147)) ([6761c2b](https://github.com/elastic/elastic-charts/commit/6761c2b))

# [3.6.0](https://github.com/elastic/elastic-charts/compare/v3.5.1...v3.6.0) (2019-04-04)


### Features

* **annotations:** render line annotations via LineAnnotation spec ([#126](https://github.com/elastic/elastic-charts/issues/126)) ([98ff170](https://github.com/elastic/elastic-charts/commit/98ff170))

## [3.5.1](https://github.com/elastic/elastic-charts/compare/v3.5.0...v3.5.1) (2019-04-02)


### Bug Fixes

* **build:** fix dependencies for kibana integration ([#146](https://github.com/elastic/elastic-charts/issues/146)) ([b875e3d](https://github.com/elastic/elastic-charts/commit/b875e3d)), closes [#145](https://github.com/elastic/elastic-charts/issues/145)

# [3.5.0](https://github.com/elastic/elastic-charts/compare/v3.4.5...v3.5.0) (2019-04-01)


### Bug Fixes

* **areachart:** fix misaligned rendering props  ([#141](https://github.com/elastic/elastic-charts/issues/141)) ([9694b5b](https://github.com/elastic/elastic-charts/commit/9694b5b)), closes [#140](https://github.com/elastic/elastic-charts/issues/140)


### Features

* **specs:** add name to series specs ([#142](https://github.com/elastic/elastic-charts/issues/142)) ([a6e6f49](https://github.com/elastic/elastic-charts/commit/a6e6f49)), closes [#136](https://github.com/elastic/elastic-charts/issues/136)

## [3.4.5](https://github.com/elastic/elastic-charts/compare/v3.4.4...v3.4.5) (2019-03-29)


### Bug Fixes

* **animation:** re-enabled animateData prop to disable animation ([#129](https://github.com/elastic/elastic-charts/issues/129)) ([32b4263](https://github.com/elastic/elastic-charts/commit/32b4263))
* **specs:** limit xScaleType to linear, time and ordinal ([#127](https://github.com/elastic/elastic-charts/issues/127)) ([59c3b70](https://github.com/elastic/elastic-charts/commit/59c3b70)), closes [#122](https://github.com/elastic/elastic-charts/issues/122)

## [3.4.4](https://github.com/elastic/elastic-charts/compare/v3.4.3...v3.4.4) (2019-03-28)


### Bug Fixes

* **crosshair:** use offsetX/Y instead of clientX/Y ([#128](https://github.com/elastic/elastic-charts/issues/128)) ([7c1155f](https://github.com/elastic/elastic-charts/commit/7c1155f)), closes [#123](https://github.com/elastic/elastic-charts/issues/123)

## [3.4.3](https://github.com/elastic/elastic-charts/compare/v3.4.2...v3.4.3) (2019-03-26)


### Bug Fixes

* **chart_state:** maintain series visibility state on props update ([#118](https://github.com/elastic/elastic-charts/issues/118)) ([18e7784](https://github.com/elastic/elastic-charts/commit/18e7784))

## [3.4.2](https://github.com/elastic/elastic-charts/compare/v3.4.1...v3.4.2) (2019-03-26)


### Bug Fixes

* **rendering:** fix rendering values <= 0 on log scale ([#114](https://github.com/elastic/elastic-charts/issues/114)) ([9d7b159](https://github.com/elastic/elastic-charts/commit/9d7b159)), closes [#112](https://github.com/elastic/elastic-charts/issues/112) [#63](https://github.com/elastic/elastic-charts/issues/63)

## [3.4.1](https://github.com/elastic/elastic-charts/compare/v3.4.0...v3.4.1) (2019-03-26)


### Bug Fixes

* **brushing:** enable mouseup event outside chart element ([#120](https://github.com/elastic/elastic-charts/issues/120)) ([77d62f6](https://github.com/elastic/elastic-charts/commit/77d62f6)), closes [#119](https://github.com/elastic/elastic-charts/issues/119)

# [3.4.0](https://github.com/elastic/elastic-charts/compare/v3.3.1...v3.4.0) (2019-03-25)


### Features

* allow partial custom domain ([#116](https://github.com/elastic/elastic-charts/issues/116)) ([d0b6b19](https://github.com/elastic/elastic-charts/commit/d0b6b19))

## [3.3.1](https://github.com/elastic/elastic-charts/compare/v3.3.0...v3.3.1) (2019-03-25)


### Bug Fixes

* **chart:** fix duplicated keys for chart elements ([#115](https://github.com/elastic/elastic-charts/issues/115)) ([6f12067](https://github.com/elastic/elastic-charts/commit/6f12067))

# [3.3.0](https://github.com/elastic/elastic-charts/compare/v3.2.0...v3.3.0) (2019-03-22)


### Features

* **interactions:** crosshair ([5ddd1a8](https://github.com/elastic/elastic-charts/commit/5ddd1a8)), closes [#80](https://github.com/elastic/elastic-charts/issues/80) [#58](https://github.com/elastic/elastic-charts/issues/58) [#88](https://github.com/elastic/elastic-charts/issues/88)

# [3.2.0](https://github.com/elastic/elastic-charts/compare/v3.1.1...v3.2.0) (2019-03-19)


### Features

* **domain:** scale data to a specific domain via axis spec ([#98](https://github.com/elastic/elastic-charts/issues/98)) ([b039ebf](https://github.com/elastic/elastic-charts/commit/b039ebf))

## [3.1.1](https://github.com/elastic/elastic-charts/compare/v3.1.0...v3.1.1) (2019-03-19)


### Bug Fixes

* **npm:** add missing generated file to npm package ([6dd9140](https://github.com/elastic/elastic-charts/commit/6dd9140))

# [3.1.0](https://github.com/elastic/elastic-charts/compare/v3.0.1...v3.1.0) (2019-03-11)


### Features

* **series:** set custom series colors through spec prop ([#95](https://github.com/elastic/elastic-charts/issues/95)) ([fb09dc9](https://github.com/elastic/elastic-charts/commit/fb09dc9))

## [3.0.1](https://github.com/elastic/elastic-charts/compare/v3.0.0...v3.0.1) (2019-03-08)


### Bug Fixes

* **canvas_text_bbox_calculator:** increase font scaling factor ([#93](https://github.com/elastic/elastic-charts/issues/93)) ([f6a1f1d](https://github.com/elastic/elastic-charts/commit/f6a1f1d))

# [3.0.0](https://github.com/elastic/elastic-charts/compare/v2.1.0...v3.0.0) (2019-03-06)


### Bug Fixes

* **scale:** return ticks in millis for time scales for line/area charts ([8b46283](https://github.com/elastic/elastic-charts/commit/8b46283))


### BREAKING CHANGES

* **scale:** The  props callback is called with millis instead of Date for axis on line or area only charts.

# [2.1.0](https://github.com/elastic/elastic-charts/compare/v2.0.0...v2.1.0) (2019-03-06)


### Features

* **legend/click:** add click interations on legend titles ([#51](https://github.com/elastic/elastic-charts/issues/51)) ([7d6139d](https://github.com/elastic/elastic-charts/commit/7d6139d))

# [2.0.0](https://github.com/elastic/elastic-charts/compare/v1.1.1...v2.0.0) (2019-02-19)


### Features

* add dark theme ([#44](https://github.com/elastic/elastic-charts/issues/44)) ([766f1ad](https://github.com/elastic/elastic-charts/commit/766f1ad)), closes [#35](https://github.com/elastic/elastic-charts/issues/35)


### BREAKING CHANGES

* The `Theme.AxisConfig` type has a different signature.
It now contains `axisTitleStyle`, `axisLineStyle`, `tickLabelStyle` and
`tickLineStyle` defined as `TextStyle` or `StrokeStyle` elements.
The `Theme` interface is changed in a more flat structure.
`darkMode` prop from `Setting` is removed.
`theme` prop in `Setting` is now a `Theme` type object, not a `PartialTheme`.
You can use `mergeWithDefaultTheme` function to merge an existing theme
with a partial one.

## [1.1.1](https://github.com/elastic/elastic-charts/compare/v1.1.0...v1.1.1) (2019-02-15)


### Bug Fixes

* limit log scale domain ([f7679a8](https://github.com/elastic/elastic-charts/commit/f7679a8)), closes [#21](https://github.com/elastic/elastic-charts/issues/21)

# [1.1.0](https://github.com/elastic/elastic-charts/compare/v1.0.2...v1.1.0) (2019-02-14)


### Features

* **legend/series:** add hover interaction on legend items ([#31](https://github.com/elastic/elastic-charts/issues/31)) ([c56a252](https://github.com/elastic/elastic-charts/commit/c56a252)), closes [#24](https://github.com/elastic/elastic-charts/issues/24)

## [1.0.2](https://github.com/elastic/elastic-charts/compare/v1.0.1...v1.0.2) (2019-02-08)


### Bug Fixes

* **offscreen canvas:** set negative position to move offscreen ([#50](https://github.com/elastic/elastic-charts/issues/50)) ([0f61ac8](https://github.com/elastic/elastic-charts/commit/0f61ac8)), closes [#43](https://github.com/elastic/elastic-charts/issues/43)

## [1.0.1](https://github.com/elastic/elastic-charts/compare/v1.0.0...v1.0.1) (2019-02-07)


### Bug Fixes

* **axis labels:** offset previous space correctly ([#45](https://github.com/elastic/elastic-charts/issues/45)) ([ff2a47a](https://github.com/elastic/elastic-charts/commit/ff2a47a)), closes [#42](https://github.com/elastic/elastic-charts/issues/42)

# 1.0.0 (2019-02-07)


### Bug Fixes

* reflect specs ids on legend items when using single series ([8b39f15](https://github.com/elastic/elastic-charts/commit/8b39f15))
* **axis:** add axisTitleHeight to axis increments ([#29](https://github.com/elastic/elastic-charts/issues/29)) ([e34f0ae](https://github.com/elastic/elastic-charts/commit/e34f0ae)), closes [#26](https://github.com/elastic/elastic-charts/issues/26)
* **axis:** fix horizontal title positioning to account for title padding ([08d1f83](https://github.com/elastic/elastic-charts/commit/08d1f83))
* **axis:** scale tick labels to fix text truncation on chrome ([#38](https://github.com/elastic/elastic-charts/issues/38)) ([99c2332](https://github.com/elastic/elastic-charts/commit/99c2332)), closes [#18](https://github.com/elastic/elastic-charts/issues/18)
* **axis:** use titleFontSize for debug rect for horizontal axis title ([#17](https://github.com/elastic/elastic-charts/issues/17)) ([af4aa58](https://github.com/elastic/elastic-charts/commit/af4aa58)), closes [#11](https://github.com/elastic/elastic-charts/issues/11)
* **dimensions:** use chart top padding in computation of chart height ([42585f7](https://github.com/elastic/elastic-charts/commit/42585f7)), closes [#13](https://github.com/elastic/elastic-charts/issues/13)
* **x_domain:** fix x value asc sorting using numbers ([26b33ff](https://github.com/elastic/elastic-charts/commit/26b33ff))


### Features

* add tickLabelRotation and showGridLines features ([#7](https://github.com/elastic/elastic-charts/issues/7)) ([47f118b](https://github.com/elastic/elastic-charts/commit/47f118b))
* **axis:** draw grid lines separately from axis tick and customize style with config ([#8](https://github.com/elastic/elastic-charts/issues/8)) ([ab7e974](https://github.com/elastic/elastic-charts/commit/ab7e974))
