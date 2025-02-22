import {
  DocumentNode,
  GraphQLFieldMap,
  GraphQLOutputType,
  GraphQLSchema,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  VariableDefinitionNode,
} from 'graphql';

export type GraphQLOutputTypeMap = { [key: string]: GraphQLOutputType };

export function isMutation(document: DocumentNode) {
  const node = document.definitions[0];
  return node?.kind === 'OperationDefinition' && node.operation === 'mutation';
}

export function isQuery(document: DocumentNode) {
  const node = document.definitions[0];
  return node?.kind === 'OperationDefinition' && node.operation === 'query';
}

export function isFragment(document: DocumentNode) {
  const node = document.definitions[0];
  return node?.kind === 'FragmentDefinition';
}

export function getVariableDefinition(document: DocumentNode, name: string): VariableDefinitionNode | undefined {
  return getVariableDefinitions(document)?.find((d) => d.variable.name.value === name);
}

export function getVariableDefinitions(document: DocumentNode): ReadonlyArray<VariableDefinitionNode> | undefined {
  for (const definition of document.definitions) {
    if (definition.kind === 'OperationDefinition') {
      return definition.variableDefinitions;
    }
  }
  return undefined;
}

export function getFragmentName(document: DocumentNode): string | undefined {
  for (const definition of document.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      return definition.name.value;
    }
  }
  return undefined;
}

export function getFragmentTypeName(document: DocumentNode): string | undefined {
  for (const definition of document.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      return definition.typeCondition.name.value;
    }
  }
  return undefined;
}

export interface IFieldOutputType {
  name: string;
  typeName: string;
  isNonNull?: boolean;
  isObject?: boolean;
  isList?: boolean;
  data?: any;
}

export function getFieldMap(document: DocumentNode, schema: GraphQLSchema): GraphQLFieldMap<any, any> {
  const typeName = getFragmentTypeName(document);
  if (!typeName) {
    return {};
  }
  const type = schema.getType(typeName);
  if (!isObjectType(type)) {
    return {};
  }
  return type.getFields();
}

function typeMapFromFieldMap(fieldMap: GraphQLFieldMap<any, any>): GraphQLOutputTypeMap {
  const typeMap: GraphQLOutputTypeMap = {};
  for (const key in fieldMap) {
    typeMap[key] = fieldMap[key].type;
  }
  return typeMap;
}

export function getFieldTypeMap(document: DocumentNode, schema: GraphQLSchema): GraphQLOutputTypeMap {
  const fieldMap = getFieldMap(document, schema);
  return typeMapFromFieldMap(fieldMap);
}

export function getFragmentFields(
  document: DocumentNode,
  schema: GraphQLSchema,
): { fieldTypeMap: { [key: string]: GraphQLOutputType }; fieldSimpleMap: { [key: string]: any } } {
  const fieldTypeMap: { [key: string]: GraphQLOutputType } = {};

  const fieldSimpleMap: { [key: string]: IFieldOutputType } = {};
  const typeName = getFragmentTypeName(document);
  if (!typeName) {
    return {
      fieldTypeMap: {},
      fieldSimpleMap: {},
    };
  }

  const allFields = getFieldMap(document, schema);

  for (const definition of document.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      const fields = definition.selectionSet.selections;
      for (const field of fields) {
        if (field.kind === 'Field') {
          const fieldName = field.name.value;
          const graphQlField = allFields[fieldName];
          fieldTypeMap[fieldName] = graphQlField.type;
          // // in the caller
          let fieldType = graphQlField.type;
          let isNonNull = false;
          if (isNonNullType(fieldType)) {
            isNonNull = true;
            fieldType = fieldType.ofType;
          }

          if (isScalarType(fieldType)) {
            // make a scalar form field
            fieldSimpleMap[fieldName] = {
              name: fieldName,
              typeName: fieldType.name,
              isNonNull,
            };
          } else if (isObjectType(fieldType)) {
            // recurse
            fieldSimpleMap[fieldName] = {
              name: fieldName,
              typeName: fieldType.name,
              isObject: true,
              isNonNull,
            };
          } else if (isListType(fieldType)) {
            const innerType = fieldType.ofType;
            // recurse
            fieldSimpleMap[fieldName] = {
              typeName: innerType,
              name: fieldName,
              isList: true,
              isNonNull,
            };
          }
        }
      }
    }
  }
  return { fieldTypeMap, fieldSimpleMap };
}

export function hasVariableDefinition(document: DocumentNode, name: string) {
  return getVariableDefinition(document, name) !== undefined;
}

export function getResultFieldName(document: DocumentNode): string | undefined {
  const operation = document.definitions[0];
  if (operation?.kind === 'OperationDefinition') {
    const field = operation.selectionSet.selections[0];
    if (field?.kind === 'Field') {
      return field.name.value;
    }
  }
  return undefined;
}
