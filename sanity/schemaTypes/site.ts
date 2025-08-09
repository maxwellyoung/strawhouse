import {defineType, defineField} from 'sanity'
export default defineType({
  name: 'site',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name:'aboutBlurb', type:'array', of:[{type:'block'}]}),
    defineField({name:'address', type:'string'}),
    defineField({name:'hours', type:'string'}),
    defineField({name:'email', type:'string'}),
    defineField({name:'instagram', type:'url'}),
  ],
})
