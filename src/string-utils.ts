import _s from 'underscore.string'
import pluralize from 'pluralize'

export function getEntityNameStrings({ entityName }: { entityName: string }) {
  const classified = _s.classify(entityName)
  const classifiedPlural = pluralize(classified)
  const decapitalizedPlural = _s.decapitalize(classifiedPlural)
  const dasherizedPlural = _s.dasherize(decapitalizedPlural)

  return {
    dasherizedPlural,
  }
}

export const paramCase = (v: string) => _s.dasherize(_s.decapitalize(v))
