import _s from 'underscore.string'

export const kebabCase = (v: string) => _s.dasherize(_s.decapitalize(v))
