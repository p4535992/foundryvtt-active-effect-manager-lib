import API from "../api";
import { debug } from "../lib/lib";


      export  function findEffectsButton(): JQuery<HTMLElement> {
        return $('[data-action="effects"]');
      }

      export  function findAllStatusEffectButtons(): JQuery<HTMLElement> {
        if (isPF2E()) {
          return $(`div.effect-container, div.pf2e-effect-img-container`);
        }
        return $(`div.effect-container, img.effect-control`);
      }

      export  function findStatusEffectButtonsContainingSearchTerm(allButtons: JQuery<HTMLElement>, searchTerm: string): JQuery<HTMLElement> {
        debug('search term: ', searchTerm);
        if (isPF2E()) {
          const loweredSearchTerm = searchTerm.toLowerCase();
          debug('pf2e detected.');
          const all = allButtons;
          const children = all.children();
          const found = children.filter(`[data-effect*='${loweredSearchTerm}']`);
          const parents = found.parent();
          debug(`found: ${all}, ${children}, ${found}, ${parents}`);
          return parents;
        }
        return allButtons.filter(`[title*='${searchTerm}']`);
      }

      export function filterStatusButtons(): void {
        const searchTermTransformed = API.statusSearchTerm.trim().toLowerCase().capitalize();
        const allButtons = findAllStatusEffectButtons();
        debug('allButtons: ', allButtons);
        const buttonsToShow = findStatusEffectButtonsContainingSearchTerm(allButtons, searchTermTransformed);
        debug('found Buttons: ', buttonsToShow);
        if (!API.statusSearchTerm) {
          allButtons.css('display', 'block');
        } else {
          allButtons.css('display', 'none');
          buttonsToShow.css('display', 'block');
        }
      }

      export function isPF2E(): boolean {
        return game.system.id === 'pf2e';
      }
