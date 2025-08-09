import {defineType, defineField} from 'sanity'
export default defineType({
  name: 'show',
  type: 'document',
  title: 'Show',
  fields: [
    defineField({name:'title', type:'string', validation:r=>r.required()}),
    defineField({name:'subtitle', type:'string'}),
    defineField({name:'artists', type:'array', of:[{type:'string'}]}),
    defineField({name:'start', type:'date', options:{dateFormat:'YYYY-MM-DD'}, validation:r=>r.required()}),
    defineField({name:'end', type:'date', options:{dateFormat:'YYYY-MM-DD'}}),
    defineField({name:'venue', type:'string', initialValue:'Strawhouse'}),
    defineField({name:'press', type:'array', of:[{type:'block'}]}),
    defineField({name:'hero', type:'image', options:{hotspot:true}}),
    defineField({
      name:'gallery',
      type:'array',
      of:[{type:'image', options:{hotspot:true}, fields:[{name:'caption', type:'string'}]}],
    }),
    defineField({name:'links', type:'array', of:[{type:'object', fields:[{name:'label', type:'string'},{name:'url', type:'url'}]}]}),
    defineField({name:'slug', type:'slug', options:{source:'title', maxLength:96}, validation:r=>r.required()}),
    defineField({
      name:'year', type:'number', readOnly:true,
      initialValue: ({parent}) => parent?.start ? Number(String(parent.start).slice(0,4)) : undefined,
    }),
  ],
})
