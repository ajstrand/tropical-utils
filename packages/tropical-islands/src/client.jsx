// import React from 'react'
// import { hydrateRoot } from 'react-dom/client'
/** @jsx h */
import { h } from 'preact';

import { hydrate } from 'preact';


export function hydrateIslands(islands, Providers = ({ children }) => children) {
  document.querySelectorAll('[data-tropical-hydration-component]').forEach((island) => {
    const Component = islands[island.dataset.tropicalHydrationComponent]

    if (!Component) {
      console.warn(
        `Found a server-rendered Tropical Island for ${island.dataset.tropicalHydrationComponent} but that component was not passed to hydrateIslands`
      )
      return
    }

    const hydrationProps = JSON.parse(island.dataset.tropicalHydrationProps)
    hydrate(
      island,
      <Providers>
        <Component {...hydrationProps} />
      </Providers>
    )
  })
}
