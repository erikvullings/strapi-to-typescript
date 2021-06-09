import { ITestobject, ITestobjectrelation, EnumITestobjectenum_field } from './out2';
import { IFile } from './out2/file/file';
import { IComplex, EnumIComplexvariant } from "./out2/content/complex";
import { ISimple } from "./out2/content/simple";
import { IWithDash } from "./out2/content/camel-case";
import { IJustACompleteOtherName } from "./out2/content/another";

class IComplexImpl implements IComplex {
    id: string;
    variant?: EnumIComplexvariant;
    key?: string;
    single?: IComplex;
    repeatable: IComplex[];
    dynamic: (
        | ({ __component: 'content.complex' } & IComplex)
        | ({ __component: 'content.simple' } & ISimple)
    )[];

    constructor(){
        this.id = "id";
        this.repeatable = [];
        this.dynamic = [];
    }
}

// implementation of Itestobject test required and type fields
class ItestobjectImpl implements ITestobject {
    id: string;

    string_optional_field?: string;
    short_text_field: string;
    long_text_field: string;
    richtext_field: string;
    integer_field: number;
    big_integer_field: number;
    truncated_float_field: number;
    float_field: number;
    date_field: Date;
    datetime_field: any;
    time_field: any;
    boolean_field: boolean;
    email_field: string;
    password_field: string;
    enum_field: EnumITestobjectenum_field;
    mulitple_media_field: any[];
    single_media_field?: IFile;
    json_field: { [key: string]: any; };
    uid_field: any;
    created_by: string;
    component_complex: IComplex;
    component_complex_optional?: IComplex;
    component_complex_repeatable:IComplex[];
    dynamiczone: (
        | ({ __component: 'content.complex' } & IComplex)
        | ({ __component: 'content.simple' } & ISimple)
        | ({ __component: 'content.camel-case' } & IWithDash)
        | ({ __component: 'content.another' } & IJustACompleteOtherName)
    )[];

    testobjectrelation?: ITestobjectrelation;
    testobjectrelations: ITestobjectrelation[];

    constructor() {
        this.id = "id"
        this.short_text_field = "short_text";
        this.long_text_field = "long_text_field";
        this.richtext_field = "richtext_field";
        this.integer_field = 1;
        this.big_integer_field = 2;
        this.truncated_float_field = 3;
        this.float_field = 4;
        this.date_field = new Date();
        this.boolean_field = true;
        this.email_field = "email_field";
        this.password_field = "password_field";
        this.enum_field = EnumITestobjectenum_field.enum1;
        this.json_field = {};
        this.created_by = "created_by";

        this.testobjectrelations = [];
        this.dynamiczone = [];

        // TOFII => any field

        this.mulitple_media_field = [];
        this.datetime_field = {};
        this.time_field = {};
        this.uid_field = {};

        this.component_complex = new IComplexImpl();
        this.component_complex_repeatable = [];
    }
}

class ItestobjectrelationImpl implements ITestobjectrelation {
    id: string;

    testobject_one_way?: ITestobject;
    testobject_one_one?: ITestobject;
    testobjects_one_many: ITestobject[];
    testobject_many_one?: ITestobject;
    testobjects_many_many: ITestobject[];
    testobjects_poly: ITestobject[];

    constructor(testobject: ITestobject) {
        this.id = "id";
        this.testobjects_one_many = [testobject];
        this.testobjects_many_many = [testobject];
        this.testobjects_poly = [testobject];
    }
}

// test optional fields
const testobject = new ItestobjectImpl();
testobject.string_optional_field = "stringfieldoptional";

const testobjectrelation = new ItestobjectrelationImpl(testobject);
testobjectrelation.testobject_one_way = testobject;
testobjectrelation.testobject_one_one = testobject;
testobjectrelation.testobject_many_one = testobject;